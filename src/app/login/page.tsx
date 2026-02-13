import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from './actions';
import Link from 'next/link';

export default async function LoginPage() {
    // If already logged in, redirect to home
    const user = await getCurrentUser();
    if (user) {
        redirect('/');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">iPurchase Management</CardTitle>
                    <CardDescription className="text-center">
                        Melden Sie sich an um fortzufahren
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={login} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Benutzername</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="admin"
                                required
                                autoComplete="username"
                                autoFocus
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
                                autoComplete="current-password"
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Anmelden
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <p className="text-muted-foreground">
                            Noch kein Konto?{' '}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                Jetzt registrieren
                            </Link>
                        </p>
                    </div>
                    <div className="mt-4 text-center text-sm text-muted-foreground border-t pt-4">
                        <p><strong>Standard Login:</strong> admin / admin123</p>
                        <p className="text-xs mt-1">Bitte ändern Sie das Passwort nach dem ersten Login!</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
