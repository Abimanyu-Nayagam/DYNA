import React from "react";

interface Card {
  title: string;
  image: string;
  description: string;
}

const cards: Card[] = [
  { title: "iPhone 14", image: "/images/iphone1.jpg", description: "Amazing display." },
  { title: "iPhone 14 Plus", image: "/images/iphone2.jpg", description: "Great camera." },
  { title: "iPhone 14 Pro", image: "/images/iphone3.jpg", description: "Next-gen processor." },
  // add more cards
];

const ProductCarousel: React.FC = () => {
  return (
    <section className="py-12 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-6">Get the highlights</h2>

      <div className="relative overflow-x-auto flex space-x-6 px-6 snap-x snap-mandatory scrollbar-hide">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="snap-center flex-shrink-0 min-w-[300px] md:min-w-[400px] bg-white rounded-xl shadow-lg p-4 transform transition-transform duration-300 hover:scale-105"
          >
            <img src={card.image} alt={card.title} className="rounded-lg mb-4" />
            <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
            <p className="text-gray-700">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Optional: Dots below the carousel */}
      <div className="flex justify-center mt-4 space-x-2">
        {cards.map((_, idx) => (
          <span
            key={idx}
            className="w-3 h-3 rounded-full bg-gray-400"
          ></span>
        ))}
      </div>
    </section>
  );
};

export default ProductCarousel;
