"use client";

import { Hero } from "@/components/home/hero"
import { Header, ProductGrid, Footer } from "@/components/home/index"
import Cart from "@/components/home/cart"

const Home = () => {
  return (
    <div className="min-h-screen bg-yellow-50">
      <Header />
      <Hero />
        <main className="container mx-auto px-4 py-8">
          <ProductGrid />
        </main>
      <Footer />
      <Cart />
    </div>
  );
};

export default Home;
