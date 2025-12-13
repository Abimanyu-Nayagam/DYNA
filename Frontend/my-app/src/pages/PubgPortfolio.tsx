import { useState, useEffect } from 'react'
import '@/styles/pubgportfolio.css'

const PubgPortfolio = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 7500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="pubg-loading-screen">
      </div>
    );
  }

  return (
    <div>
      {/* your actual portfolio content */}
    </div>
  );
};

export default PubgPortfolio;
