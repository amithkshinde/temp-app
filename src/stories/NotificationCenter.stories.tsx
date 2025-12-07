
import type { Meta, StoryObj } from '@storybook/react';
import { NotificationCenter } from '@/components/ui/notification-center';
import { NotificationProvider } from '@/context/NotificationContext';
// Mock Auth Provider Wrapper if needed, or simple decorator

const meta: Meta<typeof NotificationCenter> = {
    title: 'Dashboard/NotificationCenter',
    component: NotificationCenter,
    decorators: [
        (Story) => (
            <div className="flex justify-end p-4 bg-gray-100">
                {/* We need to mock the context logic or wrap it. 
             Ideally we use a MockProvider, but for simplicity here we assume decorator works 
             if we had a proper mock. Since we don't have easy context mocking setup in this environment files,
             we will just render the component which might fail without context.
             
             Let's try to verify if we need to mock hooks. 
             The component uses `useNotifications`. 
         */}
                <NotificationProvider>
                    <Story />
                </NotificationProvider>
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof NotificationCenter>;

export const Default: Story = {};
