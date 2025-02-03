import React from "react";
import BlackholeEffect from "./animation/page";


const HomePage = () => {
  return (
      <div className="bg-black min-h-screen ">
        <div className="relative z-10">
          <div
              aria-hidden="true"
              className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          ></div>
          <div className="py-24 sm:py-32 lg:pb-40">
            <div className="mx-auto max-w-8xl px-4 lg:px-10">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-balance text-white sm:text-6xl">
                  Create, customize and deploy AI agents on X
                </h1>
                <p className="mt-8 text-lg font-medium text-pretty text-gray-400 sm:text-xl/8">
                  Developing your fleet of autonomous agents should be straightforward, efficient,
                  and decentralized. AgentX Hub offers users a fluid experience to build precision-focused AI
                  agents without any technical skill.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <a
                      href="create-agent"
                      className="rounded-md bg-white font-semibold px-3.5 py-2.5 text-sm text-black shadow-xs focus-visible:outline-2"
                  >
                    Create your Agent
                  </a>
                  <a
                      href="browse-agents"
                      className="rounded-md bg-gray-800 font-semibold px-3.5 py-2.5 text-sm text-white shadow-xs focus-visible:outline-2"
                  >
                    Browse your Agent
                  </a>
                </div>
                <div className="mt-10 gap-x-6">
                  <h5 className="font-semibold tracking-tight text-balance text-white">
                    RnmmJn1VtKYv9Gsnyg1qwr2ExJf5nExdX5zDrrCpump
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default HomePage;
