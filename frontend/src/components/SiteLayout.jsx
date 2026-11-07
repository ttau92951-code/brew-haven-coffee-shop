import { Outlet } from 'react-router-dom';

import CartDrawer from './CartDrawer.jsx';
import Footer from './Footer.jsx';
import Navbar from './Navbar.jsx';

export default function SiteLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
