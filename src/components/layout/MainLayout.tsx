import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;