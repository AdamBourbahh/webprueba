import Head from 'next/head'
import HeroSection from '../src/components/HeroSection'

export default function Home() {
  return (
    <>
      <Head>
        <title>Club de Programación Competitiva - UGR</title>
        <meta name="description" content="Club de Programación Competitiva de la Universidad de Granada" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HeroSection />
    </>
  )
} 