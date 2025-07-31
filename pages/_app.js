import '../styles/globals.css'
import { ThemeProvider } from '../src/context/ThemeContext'
import { ContentProvider } from '../src/context/ContentContext'
import BackgroundEffects from '../src/components/BackgroundEffects'
import Header from '../src/components/Header'

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <ContentProvider>
        <div className="min-h-screen w-full bg-pure-white dark:bg-black text-black dark:text-white flex flex-col items-center">
          <BackgroundEffects />
          <Header />
          <main className="w-full relative z-10 pt-20">
            <Component {...pageProps} />
          </main>
        </div>
      </ContentProvider>
    </ThemeProvider>
  )
} 