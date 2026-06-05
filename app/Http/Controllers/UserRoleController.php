<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\UpdateUserRolesRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\RouteAttributes\Attributes\Get;
use Spatie\RouteAttributes\Attributes\Middleware;
use Spatie\RouteAttributes\Attributes\Put;

#[Middleware(['auth', 'verified'])]
class UserRoleController extends Controller
{
    #[Get('users', name: 'users.index')]
    public function index(): Response
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()
            ->with('roles:id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(fn (User $user): array => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
            ]);

        return Inertia::render('users/index', [
            'users' => $users,
        ]);
    }

    #[Get('users/{user}/roles', name: 'users.roles.edit')]
    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        return Inertia::render('users/edit-roles', [
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
            ],
            'roles' => Role::query()->orderBy('name')->pluck('name'),
        ]);
    }

    #[Put('users/{user}/roles', name: 'users.roles.update')]
    public function update(UpdateUserRolesRequest $request, User $user): RedirectResponse
    {
        $user->syncRoles($request->validated('roles', []));

        return to_route('users.index');
    }
}
