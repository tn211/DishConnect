import React from "react";
import Layout from "../../components/layout-components/Layout";
import stock1 from "../../assets/stock1istockphoto-1253249134-612x612.jpg";
import stock2 from "../../assets/stock2istockphoto-1199670834-1024x1024 1.png";

const AboutUs = () => {
  return (
    <Layout>
      <div className="bg-[#0f0f0f] min-h-[calc(100vh-4rem)]">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center gap-10 mb-20">
            <div className="flex-1">
              <h1 className="text-4xl font-semibold text-white mb-4 tracking-tight">
                About Us
              </h1>
              <p className="text-neutral-400 leading-relaxed text-base">
                We are a team passionate about cooking and all the cultural
                diversity that it can provide and be expressed through it. This
                love for sharing our experiences led us to create DishConnect, a
                great community for every person, with or without experience, to
                explore and contribute to this wonderful world of gastronomy.
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
              <h2 className="text-3xl font-semibold text-white mb-4 tracking-tight">
                Our Mission
              </h2>
              <p className="text-neutral-400 leading-relaxed text-base">
                Our mission is to create the most diverse and friendly culinary
                community, empowering people from all over the world to share,
                explore and enjoy recipes from every corner of the planet,
                promoting the exchange of knowledge and experiences.
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
