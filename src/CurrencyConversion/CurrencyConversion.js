import React from 'react'; 
import './CurrencyConversion.css';

const allCurrencySymbols = {
        "AUD": "AU$",
        "BGN": "BGN",
        "BRL": "R$",
        "CAD": "CA$",
        "CHF": "CHF",
        "CNY": "CN¥",
        "CZK": "Kč",
        "DKK": "Dkr",
        "EUR": "€",
        "GPB": "£",
        "HKD": "HK$",
        "HRK": "kn",
        "HUF": "Ft",
        "IDR": "Rp",
        "ILS": "₪",
        "INR": "Rs",
        "ISK": "Ikr",
        "JPY": "¥",
        "KRW": "₩",
        "MXN": "MX$",
        "MYR": "RM",
        "NOK": "Nkr",
        "NZD": "NZ$",
        "PHP":  "₱",
        "PLN": "zł",
        "RON": "RON",
        "RUB": "RUB",
        "SEK": "Skr",
        "SGD": "S$",
        "THB": "฿",
        "TRY": "TL",
        "USD": "$",
        "ZAR": "R"
      }

function multiplay( variable, coefficient ) {
  return ( Math.round( (variable * coefficient) * 1000000 ) / 1000000 ).toString();
}

function convertCurrency( value, rate ) {
  const variable = parseFloat(value.replace(',', '.'));
  const coefficient = parseFloat(rate);
  return Number.isNaN(variable) ? '' : (multiplay(variable, coefficient)).replace(',', '.');
}

class CurrencyInput extends React.Component {
  
  constructor(props) {
    super(props);
    this.handleInputClick = this.handleInputClick.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleCurrencyChange= this.handleCurrencyChange.bind(this);
  }
  
  handleInputClick(e) {
    this.props.onInputClick(this.props.selected, e.target.value);
  }
  
  handleInputChange(e) {
    this.props.onInputChange(e.target.value);
  }
  
  handleCurrencyChange(e) {
    this.props.onCurrencyChange(e.target.value, this.props.position);
  }
  
  render() {
    const { currencies, selected, value, position } = this.props;
    return(
      <fieldset>
        <legend>{selected}</legend>
        <input 
          value={value}
          onChange={this.handleInputChange}
          onClick={this.handleInputClick} />
        <select onChange={this.handleCurrencyChange}>
          {
            currencies.map(
              currency => {
                if(currency === selected) {
                  return(
                    <option key={currency} value={currency} selected>{currency}</option>
                  );
                } else {
                  return(
                    <option key={currency} value={currency}>{currency}</option>
                  );
                }
              }
            )
          }
        </select>
      </fieldset>
    );
  }
}

class CurrencyExchange extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      currencies: [],
      currencyNo1: 'USD',
      currencyNo2: 'GBP',
      fromCurrency: '',
      toCurrency: '',
      rate: 0,
      value: '', 
      symbolNo1: '',
      symbolNo2: ''
    }
    this.updateConversion = this.updateConversion.bind(this);
    this.updateCurrency = this.updateCurrency.bind(this);
    this.updateValue = this.updateValue.bind(this);
  }
  
  componentDidMount() {
    fetch('https://api.fixer.io/latest')
      .then(data => data.json())
      .then(data => {
        const currencies = [];
        currencies.push(data.base, ...Object.entries(data.rates).map(rates => rates[0]));
        currencies.sort();
        this.setState( { currencies } );
      })
      .catch(error => console.log('Error getting currency data:', error));
  }
  

  updateConversion(fromCurrency, value) {
    const { currencyNo1, currencyNo2 } = this.state;
    const toCurrency = fromCurrency === currencyNo1 ? currencyNo2 : currencyNo1; 
    fetch(`https://api.fixer.io/latest?base=${fromCurrency}`)
      .then(data => data.json())
      .then(data => {
        this.setState(
          { 
            fromCurrency, 
            toCurrency, 
            rate: data.rates[toCurrency] || 1, 
            value
          }
        )
      })
      .catch(err => console.log(err))
  }
  
  updateValue(value) {
    this.setState(
      { value }
    );
  }
  
  updateCurrency(currency, position) {
    this.setState(
      { value: '', rate: 0, fromCurrency: '', toCurrency: '' }
    );
    if(position === 'from') {
      this.setState(
        { currencyNo1: currency }
      );
    }
    if(position === 'to') {
      this.setState(
        { currencyNo2: currency }
      );
    }
  }
  
  render() {
    const { currencies, currencyNo1, currencyNo2, fromCurrency, toCurrency, rate, value, symbol } = this.state;
    const newValue = value.replace('.', ',');
    const value1 = currencyNo1 === fromCurrency ? newValue : convertCurrency(value, rate);
    const value2 = currencyNo2 === fromCurrency ? newValue : convertCurrency(value, rate);
    return(
      <CurrencyExchange>
        <CurrencyInput
          symbol={symbol}
          position={'from'}
          currencies={currencies}
          selected={currencyNo1}
          value={value1}
          onInputClick={this.updateConversion}
          onInputChange={this.updateValue}
          onCurrencyChange={this.updateCurrency} />
        <CurrencyInput
          position={'to'}
          currencies={currencies}
          selected={currencyNo2}
          value={value2}
          onInputClick={this.updateConversion}
          onInputChange={this.updateValue}
          onCurrencyChange={this.updateCurrency} />
        <section className='conversion-info'>
          <p>Current Exchange Rate = {rate}</p>
        </section>
      </CurrencyExchange>
    );
  }
}

class Header extends React.Component {
  render() {
    return(
      <header>
        <h1>Currency Converter</h1>
      </header>
    );
  }
}

export default class CurrencyConverter extends React.Component {
  render() {
    return(
      <section className='app'>
        <Header />
        <CurrencyExchange />
      </section>
    );
  }
}

