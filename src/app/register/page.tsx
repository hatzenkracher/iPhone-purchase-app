import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register } from './actions';
import Link from 'next/link';

export default async function RegisterPage() {
    // If already logged in, redirect to home
    const user = await getCurrentUser();
    if (user) {
        redirect('/');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Konto erstellen</CardTitle>
                    <CardDescription className="text-center">
                        Erstellen Sie ein neues Konto für iPurchase Management
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={register} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Benutzername</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="benutzername"
                                required
                                autoComplete="username"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-Mail</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="email@beispiel.de"
                                required
                                autoComplete="email"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Ihr Name"
                                required
                                autoComplete="name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Passwort</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                autoComplete="new-password"
                                minLength={6}
                            />
                            <p className="text-xs text-muted-foreground">
                                Mindestens 6 Zeichen
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                required
                                autoComplete="new-password"
                                minLength={6}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Registrieren
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <p className="text-muted-foreground">
                            Haben Sie bereits ein Konto?{' '}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Jetzt anmelden
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
