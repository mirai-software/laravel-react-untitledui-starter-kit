/** The kit's permissions (created by the `create_default_roles_and_permissions` migration), named `resource.action`. */
export type AppPermission =
    | 'roles.view'
    | 'roles.create'
    | 'roles.update'
    | 'roles.delete'
    | 'users.view'
    | 'users.create'
    | 'users.update'
    | 'users.delete';
