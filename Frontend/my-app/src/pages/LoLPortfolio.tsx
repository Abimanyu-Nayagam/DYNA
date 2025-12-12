import React, { use } from "react"
import { useState, useEffect } from "react"
import Footer from "@/components/Footer"

const LoLPortfolio = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        // Simulate data fetching
        setTimeout(() => {
            setData(
                
            );
            setLoading(false);
        }
        , 2000);
    }, []);

  return (
    <div id="LoLPortfolio">
        <h1>League of Legends Portfolio Page</h1>
        <Footer/>
    </div>
    )
}

export default LoLPortfolio