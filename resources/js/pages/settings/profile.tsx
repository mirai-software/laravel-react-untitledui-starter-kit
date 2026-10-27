import { Form, Head, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import TextLink from '@/components/text-link';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';

type ProfileProps = {
    mustVerifyEmail: boolean;
    status?: string;
};

const Profile = ({ mustVerifyEmail, status }: ProfileProps) => {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Impostazioni profilo" />

            <h1 className="sr-only">Impostazioni profilo</h1>

            <div className="flex flex-col gap-6">
                <Heading
                    variant="small"
                    title="Profilo"
                    description="Aggiorna nome e indirizzo email"
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <Input
                                name="name"
                                label="Nome"
                                defaultValue={auth.user.name}
                                isRequired
                                autoComplete="name"
                                placeholder="Nome e cognome"
                                isInvalid={Boolean(errors.name)}
                                hint={errors.name}
                            />

                            <Input
                                name="email"
                                type="email"
                                label="Email"
                                defaultValue={auth.user.email}
                                isRequired
                                autoComplete="username"
                                placeholder="email@example.com"
                                isInvalid={Boolean(errors.email)}
                                hint={errors.email}
                            />

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm text-tertiary">
                                            Il tuo indirizzo email non è
                                            verificato.{' '}
                                            <TextLink href={send()} as="button">
                                                Invia di nuovo l'email di
                                                verifica.
                                            </TextLink>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <p className="text-sm font-medium text-success-primary">
                                                Un nuovo link di verifica è
                                                stato inviato al tuo indirizzo
                                                email.
                                            </p>
                                        )}
                                    </div>
                                )}

                            <div>
                                <Button
                                    type="submit"
                                    isDisabled={processing}
                                    isLoading={processing}
                                    data-test="update-profile-button"
                                >
                                    Salva
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
        </>
    );
};

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Impostazioni profilo',
            href: edit(),
        },
    ],
};

export default Profile;
