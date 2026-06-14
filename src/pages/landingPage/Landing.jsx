import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import SplitCTA from './SplitCTA';
import WorkFlow from './Workflow';
import CTA from './CTA';
import Footer from './Footer';

const Landing = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <SplitCTA />
      <WorkFlow />
      <CTA />
      <Footer />
    </>
  )
}

export default Landing