
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

import { Suspense } from 'react';

function ActionPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const action = searchParams.get('action');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing your request...');

    useEffect(() => {
        if (!token || !action) {
            setStatus('error');
            setMessage('Invalid link. Missing parameters.');
            return;
        }

        const processAction = async () => {
            try {
                // Decode token (mock: base64)
                const leaveId = atob(token);

                const res = await fetch(`/api/leaves/${leaveId}/${action}`, {
                    method: 'POST'
                });

                if (res.ok) {
                    setStatus('success');
                    setMessage(`Leave request successfully ${action}ed.`);
                } else {
                    const data = await res.json();
                    throw new Error(data.error || 'Action failed');
                }
            } catch (err: unknown) {
                setStatus('error');
                if (err instanceof Error) {
                    setMessage(err.message);
                } else {
                    setMessage('Failed to process request.');
                }
            }
        };

        processAction();
    }, [token, action]);

    return (
        <div className="bg-white p-8 rounded-[var(--radius-xl)] shadow-lg max-w-md w-full text-center space-y-4">
            {status === 'loading' && (
                <>
                    <div className="animate-spin h-8 w-8 border-4 border-[var(--color-brand-pink)] border-t-transparent rounded-full mx-auto"></div>
                    <h2 className="text-xl font-bold text-gray-800">Processing...</h2>
                    <p className="text-gray-500">{message}</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <div className="text-4xl">✅</div>
                    <h2 className="text-2xl font-bold text-gray-800">Success!</h2>
                    <p className="text-gray-600">{message}</p>
                    <div className="pt-4">
                        <Button onClick={() => router.push('/management/dashboard')} className="w-full">
                            Go to Dashboard
                        </Button>
                    </div>
                </>
            )}

            {status === 'error' && (
                <>
                    <div className="text-4xl">❌</div>
                    <h2 className="text-2xl font-bold text-red-600">Error</h2>
                    <p className="text-gray-600">{message}</p>
                    <div className="pt-4">
                        <Button onClick={() => router.push('/login')} variant="secondary" className="w-full">
                            Return to Login
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

export default function ActionPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <ActionPageContent />
            </Suspense>
        </div>
    );
}
