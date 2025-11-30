import Hero from './components/Hero';
import Services from './components/Services';
import DataGrowth from './components/DataGrowth';
import ChaosToOrder from './components/ChaosToOrder';
import About from './components/About';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617]">
      <Hero />
      <ChaosToOrder />
      <DataGrowth />
      <Services />
      <About />
      <Footer />
    </main>
  );
}
