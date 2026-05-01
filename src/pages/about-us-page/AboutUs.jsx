import React from "react";
import Layout from "../../components/layout-components/Layout";
import stock1 from "../../assets/stock1istockphoto-1253249134-612x612.jpg";
import stock2 from "../../assets/stock2istockphoto-1199670834-1024x1024 1.png";

const AboutUs = () => {
  return (
    <Layout>
      <div className="bg-[#0f0f0f] min-h-[calc(100vh-4rem)]">
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-14">
          <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
            <div className="flex-1">
              <h1 className="pixel-ui text-4xl font-semibold text-white mb-4 tracking-tight">
                About Us
              </h1>
              <p className="text-neutral-400 leading-relaxed text-base">
                We're a team of food obsessives who believe cooking is one of the most direct ways to experience other cultures. That belief became DishConnect, a community where anyone, seasoned cook or total beginner, can explore and share the flavors that make up our world.
              </p>
            </div>
            <div className="w-full md:w-80 h-64 rounded-2xl overflow-hidden border border-white/10 shrink-0">
              <img
                src={stock1}
                alt="About us"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center gap-10">
            <div className="flex-1">
              <h2 className="pixel-ui text-3xl font-semibold text-white mb-4 tracking-tight">
                Our Mission
              </h2>
              <p className="text-neutral-400 leading-relaxed text-base">
                We are building the most diverse and welcoming culinary community on the planet, giving people everywhere a place to share recipes, swap techniques, and connect over the food that shaped them.
              </p>
            </div>
            <div className="w-full md:w-80 h-64 rounded-2xl overflow-hidden border border-white/10 shrink-0">
              <img
                src={stock2}
                alt="Our mission"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutUs;
