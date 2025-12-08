import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileFABProps {
    onClick: () => void;
}

export function MobileFAB({ onClick }: MobileFABProps) {
    return (
        <div className="fixed bottom-6 right-6 z-40 md:hidden">
            <Button
                className="rounded-full w-14 h-14 bg-[var(--color-brand-pink)] hover:bg-[var(--color-brand-pink)]/90 text-white shadow-lg shadow-pink-500/30 flex items-center justify-center p-0"
                onClick={onClick}
            >
                <Plus size={28} />
            </Button>
        </div>
    );
}
