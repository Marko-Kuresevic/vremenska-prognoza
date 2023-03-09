import { useState, useEffect } from "react";
import axios from "axios";

const useFetch = (url) => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
  
      try {
        const response = await axios.get(url);
        setWeatherData(response.data);
      } catch (error) {
        setError(error);
      }
  
      setIsLoading(false);
    };
  
    fetchData();
  }, [url]);
  
  console.log(weatherData);
  

  return { weatherData, isLoading, error };
}

export default useFetch;
