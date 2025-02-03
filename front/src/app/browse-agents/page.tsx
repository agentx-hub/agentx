"use client"
import Image from "next/image";
import {useMutation, useQuery, useQueryClient} from "react-query";
import axios from "axios";


import { toast } from "react-toastify";
import LoadingCircle from "@/components/Loader/loading-circle";
const posts = [
  {
    id: 1,
    agent_name: 'Agent name',
    twitter_link: '#',
    personality: 'Agent personality',
    tasks: 'Tasks tasks',
    author: {
      name: 'Michael Foster'
    }
  },
  {
    id: 2,
    agent_name: 'Agent name',
    twitter_link: '#',
    personality: 'Agent personality',
    category: { title: 'Marketing', href: '#' },
    tasks: 'Tasks tasks',
    author: {
      name: 'Michael Foster'
    }
  },
  {
    id: 3,
    agent_name: 'Agent name',
    twitter_link: '#',
    personality: 'Agent personality',
    tasks: 'Tasks tasks',
    author: {
      name: 'Michael Foster'
    }
  },
  {
    id: 4,
    agent_name: 'Agent name',
    twitter_link: '#',
    personality: 'Agent personality',
    tasks: 'Tasks tasks',
    author: {
      name: 'Michael Foster'
    }
  }
];
const getAgents = async () => {

  axios.defaults.headers.post['Content-Type'] ='application/json;charset=utf-8';
  axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

  try {

    const response = await axios.get("https://bf19-197-15-57-248.ngrok-free.app/agents",{
      headers: { "ngrok-skip-browser-warning": "true" }
    });
    // Vérifie si la réponse contient bien des données

    if (!response.data || !Array.isArray(response.data.agents)) {
      throw new Error("Données invalides reçues de l'API");
    }

    // Formate chaque agent reçu dans le bon modèle
    return response.data.agents;

  } catch (error) {
    throw new Error("Impossible de récupérer les agents.");
  }
};
const BrowseAgents = () => {
  const queryClient = useQueryClient();
  axios.defaults.headers.post['Content-Type'] ='application/json;charset=utf-8';
  axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

  const { data: agents, isLoading, error } = useQuery({
    queryKey: ["agents"],
    queryFn: getAgents,
    staleTime: 30, // Met en cache les données 5 minutes
    retry: 2, // Tente de refaire la requête 2 fois en cas d'échec
  });

  return (
    <div className="bg-black">

      <div className="relative isolate ">
        <div className="py-24 sm:py-24 lg:pb-40">
          <div className="flex justify-center items-center flex-row">
            <div className="basis-2/3 p-5 rounded-lg">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0">
                  <h2 className="text-2xl font-semibold tracking-tight text-pretty text-white sm:text-2xl">
                    Browse all agents created on our platform
                  </h2>
                  <p className="mt-2 text-lg/10 text-gray-500">
                    {' '}
                    Discover AI Agents created by our community.
                  </p>
                </div>

                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                  {agents && agents.map((agent: any) => (
                    <article
                      key={agent.id}
                      className="flex max-w-xl flex-col bg-gray-950 items-start  rounded-lg justify-between"
                    >
                      <div className="group relative text-white">
                        <h2 className="mt-2  text-white  text-sm/6 font-semibold">
                          <Image width={15}  height={15} src="/icons8-ai-64.png" className="inline mr-1" alt="logo"/>
                          {agent.agent_name}
                        </h2>
                        <p className="text-sm/6 text-gray-500">Created by {agent.name}</p>
                      </div>
                      <div className="group relative">
                        <h2 className="mt-2 text-sm/6 font-semibold text-white">Personality</h2>
                        <p className="text-sm/6  text-gray-500">{agent.personality}</p>
                      </div>
                      {/*<div className="group relative">*/}
                      {/*  <h2 className="mt-2 text-sm/6 font-semibold text-white">Tasks</h2>*/}
                      {/*  <p className="text-sm/6 text-gray-500">{post.tasks}</p>*/}
                      {/*</div>*/}
                      <div className="relative  flex items-center ">
                        <div className="text-sm/6 text-white inline">
                          <svg fill="currentColor"  className="w-5 h-10 mr-1 mb-1 text-gray-300  inline" viewBox="0 0 24 24" >
                            <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
                          </svg>
                          <a
                              href={'' + agent.twitter_link}
                              className="  font-semibold text-xs hover:text-gray-900 dark:hover:text-white dark:text-gray-400"
                          >

                            View on X
                          </a>
                        </div>

                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BrowseAgents;
