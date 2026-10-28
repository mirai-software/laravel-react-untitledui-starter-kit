<?php

namespace App\Http\Controllers;

use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;
use Spatie\RouteAttributes\Attributes\Delete;
use Spatie\RouteAttributes\Attributes\Get;
use Spatie\RouteAttributes\Attributes\Middleware;
use Spatie\RouteAttributes\Attributes\Post;
use Spatie\RouteAttributes\Attributes\Put;
use Spatie\RouteAttributes\Attributes\WithTrashed;
use Throwable;

#[Middleware(['auth', 'verified'])]
class UserController extends Controller
{
    /**
     * Show the users list, deactivated users included, with what the current user can do on each row.
     */
    #[Get('users', name: 'users.index')]
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        /** @var User $currentUser */
        $currentUser = $request->user();

        $users = User::query()
            ->withTrashed()
            // The policies compare each user's permissions with the current user's.
            ->with(['roles:id,name', 'roles.permissions:id,name', 'permissions:id,name'])
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'deleted_at'])
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'is_active' => ! $user->trashed(),
                'is_current_user' => $currentUser->is($user),
                'can' => [
                    'update' => ! $user->trashed() && $currentUser->can('update', $user),
                    'delete' => ! $user->trashed() && $currentUser->isNot($user) && $currentUser->can('delete', $user),
                    'restore' => $user->trashed() && $currentUser->can('restore', $user),
                ],
            ]);

        return Inertia::render('users/index', [
            'users' => $users,
        ]);
    }

    /**
     * Show the form to create a user.
     */
    #[Get('users/create', name: 'users.create')]
    public function create(Request $request): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('users/create', [
            ...$this->roleOptions($request),
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]);
    }

    /**
     * Store a new user, and send them the email verification link. An admin chooses the roles;
     * a user created by anyone else gets the `user` role.
     */
    #[Post('users', name: 'users.store')]
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = DB::transaction(function () use ($request): User {
            $user = User::create([
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
                'password' => $request->validated('password'),
            ]);

            $user->syncRoles($this->canAssignRoles($request) ? $request->validated('roles') : [Role::USER]);

            return $user;
        });

        Inertia::flash('toast', $this->sendVerificationLink($user)
            ? ['type' => 'success', 'message' => __('Utente creato.')]
            : ['type' => 'warning', 'message' => __('Utente creato, ma l\'email di verifica non è partita: potrà richiederla di nuovo dopo l\'accesso.')]);

        return to_route('users.index');
    }

    /**
     * Show the form to edit a user.
     */
    #[Get('users/{user}/edit', name: 'users.edit')]
    public function edit(Request $request, User $user): Response
    {
        $this->authorize('update', $user);

        $isEditingThemselves = $request->user()?->is($user) ?? false;

        return Inertia::render('users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
            ],
            ...$this->roleOptions($request),
            // An admin can't remove the admin role from themselves (UpdateUserRequest).
            'lockedRoles' => $isEditingThemselves && $user->hasRole(Role::ADMIN) ? [Role::ADMIN] : [],
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]);
    }

    /**
     * Update a user. The password only changes when filled in, and a new email has to be verified
     * again by its owner, who gets the verification link. Only an admin changes the roles.
     */
    #[Put('users/{user}', name: 'users.update')]
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $user->fill([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
        ]);

        $emailChanged = $user->isDirty('email');

        if ($emailChanged) {
            $user->email_verified_at = null;
        }

        if ($request->filled('password')) {
            $user->password = $request->validated('password');
        }

        DB::transaction(function () use ($request, $user): void {
            $user->save();

            if ($this->canAssignRoles($request)) {
                $user->syncRoles($request->validated('roles'));
            }
        });

        Inertia::flash('toast', ! $emailChanged || $this->sendVerificationLink($user)
            ? ['type' => 'success', 'message' => __('Utente aggiornato.')]
            : ['type' => 'warning', 'message' => __('Utente aggiornato, ma l\'email di verifica non è partita: potrà richiederla di nuovo dopo l\'accesso.')]);

        return to_route('users.index');
    }

    /**
     * Deactivate (soft delete) a user. Nobody can deactivate themselves from here, admins included.
     */
    #[Delete('users/{user}', name: 'users.destroy')]
    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        // The admin's Gate::before bypass skips UserPolicy::delete(), so check it here too.
        abort_if($request->user()?->is($user) ?? false, 403, __('Non puoi disattivare il tuo account da qui.'));

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Utente disattivato.')]);

        return to_route('users.index');
    }

    /**
     * Restore a deactivated user.
     */
    #[Put('users/{user}/restore', name: 'users.restore')]
    #[WithTrashed]
    public function restore(User $user): RedirectResponse
    {
        $this->authorize('restore', $user);

        $user->restore();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Utente riattivato.')]);

        return to_route('users.index');
    }

    /**
     * Send the email verification link, when the app uses email verification. A failure (e.g. the
     * mail server is down) is reported and doesn't undo the save: the user can ask for a new link
     * from the verification page.
     *
     * @return bool Whether the link was sent, or didn't need sending.
     */
    private function sendVerificationLink(User $user): bool
    {
        if (! Features::enabled(Features::emailVerification())) {
            return true;
        }

        try {
            $user->sendEmailVerificationNotification();
        } catch (Throwable $exception) {
            report($exception);

            return false;
        }

        return true;
    }

    /**
     * Only an admin assigns roles (RoleValidationRules).
     */
    private function canAssignRoles(Request $request): bool
    {
        return $request->user()?->hasRole(Role::ADMIN) ?? false;
    }

    /**
     * The role props for the user form: whether the current user can assign roles, and the roles to choose from.
     *
     * @return array{canAssignRoles: bool, roles: Collection<int, string>}
     */
    private function roleOptions(Request $request): array
    {
        $canAssignRoles = $this->canAssignRoles($request);

        return [
            'canAssignRoles' => $canAssignRoles,
            'roles' => $canAssignRoles ? Role::query()->orderBy('name')->pluck('name') : new Collection,
        ];
    }
}
