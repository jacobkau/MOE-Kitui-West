import Header from './Header';
import Footer from './Footer'; 

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        {children}
      </main>
        <Footer />
    </div>
  );
}
