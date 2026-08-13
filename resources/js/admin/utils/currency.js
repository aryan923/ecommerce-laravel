import axios from 'axios';

/**
 * Centralized Multi-Currency Formatting & Dynamic Database Conversion Utility
 *
 * Base Currency: INR (₹)
 */

let dbCurrenciesMap = {
    INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)', rate: 1.0, locale: 'en-IN' },
    USD: { code: 'USD', symbol: '$', name: 'US Dollar ($)', rate: 0.012, locale: 'en-US' },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro (€)', rate: 0.011, locale: 'de-DE' },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound (£)', rate: 0.0094, locale: 'en-GB' },
};

let isCurrenciesLoaded = false;

/**
 * Asynchronously fetch active store currencies and live exchange rates from database API.
 */
export async function loadCurrenciesFromApi() {
    try {
        const response = await axios.get('/api/v1/currencies');
        if (response.data?.success && Array.isArray(response.data.data)) {
            const fetched = response.data.data;
            const newMap = {};

            fetched.forEach((item) => {
                const code = item.code.toUpperCase();
                const localeMap = {
                    INR: 'en-IN',
                    USD: 'en-US',
                    EUR: 'de-DE',
                    GBP: 'en-GB',
                };

                newMap[code] = {
                    code: code,
                    symbol: item.symbol || '$',
                    name: `${item.name} (${item.symbol || code})`,
                    rate: parseFloat(item.exchange_rate) || 1.0,
                    locale: localeMap[code] || 'en-IN',
                    is_default: Boolean(item.is_default),
                };
            });

            if (Object.keys(newMap).length > 0) {
                dbCurrenciesMap = { ...dbCurrenciesMap, ...newMap };
                isCurrenciesLoaded = true;
            }
        }
    } catch (err) {
        console.warn('Unable to load dynamic currencies from DB API, using base rates:', err);
    }

    return dbCurrenciesMap;
}

/**
 * Convert an amount from one currency to another using database exchange rates.
 */
export function convertCurrency(amount, fromCurrency = 'INR', toCurrency = 'INR') {
    const num = parseFloat(amount) || 0;
    const fromRate = dbCurrenciesMap[fromCurrency]?.rate || 1.0;
    const toRate = dbCurrenciesMap[toCurrency]?.rate || 1.0;

    if (fromCurrency === toCurrency) {
        return num;
    }

    return num * (toRate / fromRate);
}

/**
 * Format currency value with target symbol and locale using database rates.
 */
export function formatCurrency(amount, targetCurrency = 'INR', convertFromBase = true, baseCurrency = 'INR') {
    const currencyConfig = dbCurrenciesMap[targetCurrency] || dbCurrenciesMap.INR || { symbol: '₹', locale: 'en-IN', code: 'INR' };
    const rawVal = parseFloat(amount) || 0;

    const finalVal = convertFromBase
        ? convertCurrency(rawVal, baseCurrency, targetCurrency)
        : rawVal;

    try {
        return new Intl.NumberFormat(currencyConfig.locale, {
            style: 'currency',
            currency: currencyConfig.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(finalVal);
    } catch (e) {
        return `${currencyConfig.symbol} ${finalVal.toFixed(2)}`;
    }
}

/**
 * Get currency symbol for a currency code.
 */
export function getCurrencySymbol(code = 'INR') {
    return dbCurrenciesMap[code]?.symbol || '₹';
}

/**
 * Get array of active currencies from DB map.
 */
export function getCurrencyList() {
    return Object.values(dbCurrenciesMap);
}
