import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import TopBar from './TopBar';

export default function RootLayout() {
    return (
        <div className="flex h-screen w-full bg-bg text-text-primary overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full min-w-0">
                <TopBar />
                <main className="flex-1 overflow-y-auto w-full p-4 pb-24 md:p-8">
                    <Outlet />
                </main>
            </div>
            <MobileNav />
        </div>
    );
}
