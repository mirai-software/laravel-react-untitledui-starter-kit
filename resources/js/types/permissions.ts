/** The app's permissions (created by migrations, starting with `create_default_roles_and_permissions`), named `resource.action`. */
export type AppPermission =
    | 'roles.view'
    | 'roles.create'
    | 'roles.update'
    | 'roles.delete'
    | 'users.view'
    | 'users.create'
    | 'users.update'
    | 'users.delete';
