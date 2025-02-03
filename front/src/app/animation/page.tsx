"use client"
import { motion } from "framer-motion";

const BlackholeEffect = () => {
    return (
        <div className="relative flex items-center justify-center h-screen bg-black overflow-hidden">
            {/* Halo lumineux dynamique */}
            {/*<motion.div*/}
            {/*    className="absolute w-[500px] h-[500px] bg-purple-500 rounded-full blur-3xl opacity-50"*/}
            {/*    animate={{*/}
            {/*        scale: [0.9, 1.2, 0.9],*/}
            {/*        opacity: [0.3, 0.7, 0.3],*/}
            {/*        backgroundColor: ["#8b5cf6", "#9333ea", "#8b5cf6"]*/}
            {/*    }}*/}
            {/*    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}*/}
            {/*/>*/}

            {/* Cercle central avec effet de globe flottant */}
            {/*<motion.div*/}
            {/*    className="relative w-64 h-64 rounded-full shadow-2xl border-4 border-purple-900"*/}
            {/*    style={{*/}
            {/*        background: "radial-gradient(circle, rgba(59,7,100,1) 0%, rgba(17,0,36,1) 70%)",*/}
            {/*        boxShadow: "0 0 50px rgba(147, 51, 234, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.2)"*/}
            {/*    }}*/}
            {/*    animate={{*/}
            {/*        y: [0, -20, 0], // Effet de flottement*/}
            {/*        scale: [1, 1.05, 1], // Légère pulsation*/}
            {/*        rotate: [0, 5, -5, 0] // Légère rotation*/}
            {/*    }}*/}
            {/*    transition={{*/}
            {/*        repeat: Infinity,*/}
            {/*        duration: 6,*/}
            {/*        ease: "easeInOut"*/}
            {/*    }}*/}
            {/*>*/}
                {/* Reflets intérieurs pour un effet 3D */}
            {/*    <div*/}
            {/*        className="absolute w-full h-full rounded-full"*/}
            {/*        style={{*/}
            {/*            background: "radial-gradient(circle, rgba(255,255,255,0.1) 10%, transparent 70%)",*/}
            {/*            boxShadow: "inset 0 0 30px rgba(255, 255, 255, 0.3)"*/}
            {/*        }}*/}
            {/*    />*/}
            {/*</motion.div>*/}

            {/*/!* Effet de distorsion *!/*/}
            {/*<motion.div*/}
            {/*    className="absolute w-[600px] h-[600px] bg-gradient-radial from-purple-500 to-transparent opacity-30"*/}
            {/*    animate={{*/}
            {/*        rotate: [0, 360],*/}
            {/*        scale: [1, 1.2, 1],*/}
            {/*        opacity: [0.3, 0.6, 0.3]*/}
            {/*    }}*/}
            {/*    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}*/}
            {/*/>*/}

            {/* Points flottants */}
            {/*{[...Array(50)].map((_, i) => (*/}
            {/*    <motion.div*/}
            {/*        key={i}*/}
            {/*        className="absolute w-0.5 h-0.5 bg-white rounded-full"*/}
            {/*        style={{*/}
            {/*            top: `${Math.random() * 100}%`,*/}
            {/*            left: `${Math.random() * 100}%`,*/}
            {/*            opacity: 0.7,*/}
            {/*        }}*/}
            {/*        animate={{*/}
            {/*            x: [Math.random() * 20 - 10, Math.random() * 20 - 10],*/}
            {/*            y: [Math.random() * 20 - 10, Math.random() * 20 - 10],*/}
            {/*            opacity: [0.3, 1, 0.3],*/}
            {/*            scale: [1, 1.5, 1],*/}
            {/*            backgroundColor: ["#ffffff", "#9333ea", "#ffffff"]*/}
            {/*        }}*/}
            {/*        transition={{ repeat: Infinity, duration: Math.random() * 2 + 1, ease: "easeInOut" }}*/}
            {/*    />*/}
            {/*))}*/}
        </div>
    );
};

export default BlackholeEffect;
