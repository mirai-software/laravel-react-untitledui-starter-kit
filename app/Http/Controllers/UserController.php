<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
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
    #[Get('users', name: 'users.index')]
    public function index(): Response
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()
            ->withTrashed()
            ->with('roles:id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'deleted_at'])
            ->map(fn (User $user): array => [
                'id'        => $user->id,
                'name'      => $user->name,
                'email'     => $user->email,
                'roles'     => $user->roles->pluck('name'),
                'is_active' => $user->deleted_at === null,
            ]);

        return Inertia::render('users/index', [
            'users' => $users,
        ]);
    }

    #[Get('users/create', name: 'users.create')]
    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('users/create', [
            'roles' => $this->roleNames(),
        ]);
    }

    #[Post('users', name: 'users.store')]
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = User::create([
            'name'     => $request->validated('name'),
            'email'    => $request->validated('email'),
            'password' => $request->validated('password'),
        ]);

        $user->syncRoles($request->validated('roles', []));

        return to_route('users.index');
    }

    #[Get('users/{user}/edit', name: 'users.edit')]
    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        return Inertia::render('users/edit', [
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
            ],
            'roles' => $this->roleNames(),
        ]);
    }

    #[Put('users/{user}', name: 'users.update')]
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $user->fill([
            'name'  => $request->validated('name'),
            'email' => $request->validated('email'),
        ]);

        if ($request->filled('password')) {
            $user->password = $request->validated('password');
        }

        $user->save();
        $user->syncRoles($request->validated('roles', []));

        return to_route('users.index');
    }

    #[Delete('users/{user}', name: 'users.destroy')]
    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        $user->delete();

        return to_route('users.index');
    }

    #[Put('users/{user}/restore', name: 'users.restore')]
    #[WithTrashed]
    public function restore(User $user): RedirectResponse
    {
        $this->authorize('restore', $user);

        $user->restore();

        return to_route('users.index');
    }

    /**
     * Elenco dei nomi ruolo assegnabili nel form utente.
     *
     * @return Collection<int, string>
     */
    private function roleNames(): Collection
    {
        return Role::query()->orderBy('name')->pluck('name');
    }
}
