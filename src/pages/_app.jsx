// `pages/_app.js`
import './global.css';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}