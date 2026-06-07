import React, { createContext, useState, useEffect, useContext } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState(localStorage.getItem('preferred_currency') || 'INR');
    const [rate, setRate] = useState(1);
    const [loading, setLoading] = useState(true);

    const currencies = {
        'INR': { symbol: '₹', rate: 1 },
        'USD': { symbol: '$', rate: 0.012 },
        'EUR': { symbol: '€', rate: 0.011 },
        'GBP': { symbol: '£', rate: 0.0095 },
    };

    useEffect(() => {
        const initCurrency = async () => {
            const savedCurrency = localStorage.getItem('preferred_currency');
            if (savedCurrency) {
                updateRate(savedCurrency);
                setLoading(false);
                return;
            }

            try {
                // Auto-detect if no preference (using api.country.is with open CORS policy)
                const ipRes = await fetch('https://api.country.is');
                const ipData = await ipRes.json();
                const country = ipData.country || 'IN';

                // Map country code to preferred currency
                let detectedCurrency = 'INR';
                if (country === 'US') detectedCurrency = 'USD';
                else if (['FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'GR', 'AT', 'FI', 'IE', 'PT'].includes(country)) detectedCurrency = 'EUR';
                else if (country === 'GB') detectedCurrency = 'GBP';

                if (currencies[detectedCurrency]) {
                    setCurrency(detectedCurrency);
                    updateRate(detectedCurrency);
                } else {
                    setCurrency('INR');
                    setRate(1);
                }
            } catch (error) {
                setCurrency('INR');
                setRate(1);
            } finally {
                setLoading(false);
            }
        };

        initCurrency();
    }, []);

    const updateRate = async (cur) => {
        if (cur === 'INR') {
            setRate(1);
            return;
        }
        try {
            const res = await fetch(`https://api.exchangerate-api.com/v4/latest/INR`);
            const data = await res.json();
            setRate(data.rates[cur] || currencies[cur].rate);
        } catch (e) {
            setRate(currencies[cur].rate); // Fallback to static rates
        }
    };

    const changeCurrency = (newCur) => {
        setCurrency(newCur);
        localStorage.setItem('preferred_currency', newCur);
        updateRate(newCur);
    };

    const formatPrice = (priceInINR) => {
        if (loading) return '...';
        const converted = priceInINR * rate;

        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency
        }).format(converted);
    };

    const value = {
        currency,
        rate,
        formatPrice,
        changeCurrency,
        loading,
        availableCurrencies: Object.keys(currencies)
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};
