"use client";

import {z} from "zod";
import { useState, ChangeEvent, FormEvent  } from "react";
import {useMutation, useQuery, useQueryClient} from "react-query";
import axios from "axios";
import { toast } from 'react-hot-toast';
import MyDialog from "@/components/Dialog";
import LoadingCircle from "@/components/Loader/loading-circle";
import {XCircleIcon} from "@heroicons/react/16/solid";
import { motion } from "framer-motion";

const CreateAgentSchema = z.object({
  name: z.string().nonempty(),
  personality_prompt: z.string().min(3),
  TWITTER_API_KEY: z.string().min(3),
  TWITTER_API_SECRET_KEY: z.string().min(3),
  TWITTER_ACCESS_TOKEN: z.string().min(3),
  TWITTER_ACCESS_TOKEN_SECRET: z.string().min(3),
  TWITTER_BEARER_TOKEN: z.string().min(3),
});
const CreateAgent = () => {
  type FormData = z.infer<typeof CreateAgentSchema>;
  type FormErrors = Partial<Record<keyof FormData, string[]>>;
  const [formData, setFormData] = useState<FormData>({
    name: "",
    personality_prompt: "",
    TWITTER_API_KEY: "",
    TWITTER_API_SECRET_KEY: '',
    TWITTER_ACCESS_TOKEN: "",
    TWITTER_ACCESS_TOKEN_SECRET: "",
    TWITTER_BEARER_TOKEN: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [toastError, setToastError] = useState(false);
  const [open, setOpen] = useState(false)
  const [showError, setError] = useState(false)
  const [showFakeLoader, setshowFakeLoader] = useState(false)
  const validateForm = (data: FormData): FormErrors => {
    try {
      CreateAgentSchema.parse(data);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.flatten().fieldErrors;
      }
      return {};
    }
  };
  axios.defaults.headers.post['Content-Type'] ='application/json;charset=utf-8';
  axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
  const createAgent = async (data: FormData) => {
    await new Promise(resolve => setTimeout(resolve, 5000));
    setshowFakeLoader(true)
    const { data: response } = await axios.post('https://bf19-197-15-57-248.ngrok-free.app/create-agent', data);

    return response.data;
  };
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(createAgent, {
    onSuccess: data => {
      setshowFakeLoader(false)
      console.log(data);
      // toast.success('Agent create with success');
      setOpen(true)
    },
    onError: () => {
      setshowFakeLoader(false)
      console.log("error")
      setError(true)
      toast.error('Error while create AI agent !');
    },
    onSettled: () => {
      queryClient.invalidateQueries('create');
    }
  });
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // Form is valid, proceed with submission
      console.log("Form submitted:", formData);
      mutate(formData)
    }
  };

  const handleChange = (
      e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    // // Validate form on each change
    // const newErrors = validateForm(updatedFormData);
    // setErrors(newErrors);
  };
  const {  error, data } = useQuery({
    queryKey: ['repoData'],
    queryFn: () =>
        fetch('https://api.github.com/repos/TanStack/query').then((res) =>
            res.json(),
        ),
  })

  return (
    <div className="bg-black">
      <div className="relative isolate ">
        <div className="py-24 sm:py-24 lg:pb-40">
          <div className="flex  justify-center items-center flex-row">
            <div className=" basis-2/3 p-5 bg-gray-950  rounded-lg">
              <MyDialog openDialog={open} sendToParent={setOpen} />

              { (isLoading || showFakeLoader) &&
                  <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="relative bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full"
                  >
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-md z-50 ">
                    <LoadingCircle />
                  </div>
                  </motion.div>
              }
              { showError &&
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="shrink-0">
                        <XCircleIcon aria-hidden="true" className="size-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error while creating your ai agent</h3>

                      </div>
                    </div>
                  </div>
              }
              <form onSubmit={handleSubmit} className="ring-1 shadow-xs ring-gray-900/5 sm:rounded-xl ">
                <div className="border-b border-white/10 pb-5">

                  <h2 className="text-base/8 font-semibold text-white">Define your agents profiles, instructions and personality settings</h2>
                  <p className="mt-2 text-sm/6 text-gray-400">
                    Create your AI Agents personality and behaviour for twitter.
                  </p>
                  <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                    <div className="col-span-full">
                      <label
                          htmlFor="name"
                          className="block text-sm/6 font-medium text-white"
                      >
                        Your agent name
                      </label>
                      <div className="mt-2">
                        <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                          <input
                              id="name"
                              name="name"
                              type="text"
                              onChange={handleChange}
                              value={formData.name}
                              placeholder="Name"
                              className="block w-full grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                          />
                        </div>
                        {errors.name && <span className="text-red-500">{errors.name[0]}</span>}
                      </div>
                    </div>
                    <div className="col-span-full">
                      <label
                          htmlFor="TWITTER_API_KEY"
                          className="block text-sm/6 font-medium text-white"
                      >
                       Api key
                      </label>
                      <div className="mt-2">
                        <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                          <input
                              id="TWITTER_API_KEY"
                              name="TWITTER_API_KEY"
                              type="text"
                              onChange={handleChange}
                              value={formData.TWITTER_API_KEY}
                              placeholder="api Key"
                              className="block w-full grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                          />
                        </div>
                        {errors.TWITTER_API_KEY && <span className="text-red-500">{errors.TWITTER_API_KEY[0]}</span>}
                      </div>
                    </div>
                    <div className="col-span-full">
                      <label
                          htmlFor="personality_prompt"
                          className="block text-sm/6 font-medium text-white"
                      >
                        Personality Prompt
                      </label>
                      <div className="mt-2">
                        <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                          <input
                              id="personality_prompt"
                              name="personality_prompt"
                              type="text"
                              onChange={handleChange}
                              value={formData.personality_prompt}
                              placeholder="personality Prompt"
                              className="block w-full grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                          />
                        </div>
                        {errors.personality_prompt && <span className="text-red-500">{errors.personality_prompt[0]}</span>}
                      </div>
                    </div>
                    <div className="col-span-full">
                      <label
                          htmlFor="TWITTER_API_SECRET_KEY"
                          className="block text-sm/6 font-medium text-white"
                      >
                        Api Secret
                      </label>
                      <div className="mt-2">
                        <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                          <input
                              id="TWITTER_API_SECRET_KEY"
                              name="TWITTER_API_SECRET_KEY"
                              type="text"
                              onChange={handleChange}
                              value={formData.TWITTER_API_SECRET_KEY}
                              placeholder="api Secret"
                              className="block w-full grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                          />
                        </div>
                        {errors.TWITTER_API_SECRET_KEY && <span className="text-red-500">{errors.TWITTER_API_SECRET_KEY[0]}</span>}
                      </div>
                    </div>
                    <div className="col-span-full">
                      <label
                          htmlFor="TWITTER_ACCESS_TOKEN"
                          className="block text-sm/6 font-medium text-white"
                      >
                        Access Token
                      </label>
                      <div className="mt-2">
                        <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                          <input
                              id="TWITTER_ACCESS_TOKEN"
                              name="TWITTER_ACCESS_TOKEN"
                              type="text"
                              onChange={handleChange}
                              value={formData.TWITTER_ACCESS_TOKEN}
                              placeholder="access Token"
                              className="block w-full grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                          />
                        </div>
                        {errors.TWITTER_ACCESS_TOKEN && <span className="text-red-500">{errors.TWITTER_ACCESS_TOKEN[0]}</span>}
                      </div>
                    </div>
                    <div className="col-span-full">
                      <label
                          htmlFor="TWITTER_ACCESS_TOKEN_SECRET"
                          className="block text-sm/6 font-medium text-white"
                      >
                        Access Token Secret
                      </label>
                      <div className="mt-2">
                        <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                          <input
                              id="TWITTER_ACCESS_TOKEN_SECRET"
                              name="TWITTER_ACCESS_TOKEN_SECRET"
                              type="text"
                              onChange={handleChange}
                              value={formData.TWITTER_ACCESS_TOKEN_SECRET}
                              placeholder="Access Token Secret"
                              className="block w-full grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                          />
                        </div>
                        {errors.TWITTER_ACCESS_TOKEN_SECRET && <span className="text-red-500">{errors.TWITTER_ACCESS_TOKEN_SECRET[0]}</span>}
                      </div>
                    </div>
                    <div className="col-span-full">
                      <label
                          htmlFor="TWITTER_BEARER_TOKEN"
                          className="block text-sm/6 font-medium text-white"
                      >
                        Bearer Token
                      </label>
                      <div className="mt-2">
                        <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                          <input
                              id="TWITTER_BEARER_TOKEN"
                              name="TWITTER_BEARER_TOKEN"
                              type="text"
                              onChange={handleChange}
                              value={formData.TWITTER_BEARER_TOKEN}
                              placeholder="bearer Token "
                              className="block w-full grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                          />
                        </div>
                        {errors.TWITTER_BEARER_TOKEN && <span className="text-red-500">{errors.TWITTER_BEARER_TOKEN[0]}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-center ">
                  <button
                    type="submit"
                    className="rounded-md bg-white w-full px-12 py-2 text-sm font-semibold text-black shadow-xs "
                  >
                    Create your agent
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAgent;
