<?php

namespace App\Http\Controllers;

use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\RouteAttributes\Attributes\Delete;
use Spatie\RouteAttributes\Attributes\Get;
use Spatie\RouteAttributes\Attributes\Middleware;
use Spatie\RouteAttributes\Attributes\Post;
use Spatie\RouteAttributes\Attributes\Put;
use Spatie\RouteAttributes\Attributes\WithTrashed;

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
            ->with('roles:id,name')
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
            'roles' => $this->assignableRoles($request),
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]);
    }

    /**
     * Store a new user with their roles.
     */
    #[Post('users', name: 'users.store')]
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
        ]);

        $user->syncRoles($request->validated('roles', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Utente creato.')]);

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
            'roles' => $this->assignableRoles($request),
            // An admin can't remove the admin role from themselves (UpdateUserRequest).
            'lockedRoles' => $isEditingThemselves && $user->hasRole(Role::ADMIN) ? [Role::ADMIN] : [],
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]);
    }

    /**
     * Update a user. The password only changes when filled in, and a new email has to be verified again.
     */
    #[Put('users/{user}', name: 'users.update')]
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $user->fill([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if ($request->filled('password')) {
            $user->password = $request->validated('password');
        }

        $user->save();
        $user->syncRoles($request->validated('roles', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Utente aggiornato.')]);

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
     * The role names the current user can assign in the user form: only an admin can assign the admin role.
     *
     * @return Collection<int, string>
     */
    private function assignableRoles(Request $request): Collection
    {
        return Role::query()
            ->when(! $request->user()?->hasRole(Role::ADMIN), fn ($query) => $query->where('name', '!=', Role::ADMIN))
            ->orderBy('name')
            ->pluck('name');
    }
}
