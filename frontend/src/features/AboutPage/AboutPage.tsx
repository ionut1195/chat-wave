import {
  SiTypescript,
  SiReact,
  SiPython,
  SiFastapi,
  SiTailwindcss,
} from "react-icons/si";
const AboutPage = () => {
  const technologies = [
    {
      name: "Typescript",
      icon: <SiTypescript size={36} className="text-[#007acc]" />,
    },
    { name: "React", icon: <SiReact size={36} className="text-[#5ed3f3]" /> },
    { name: "Python", icon: <SiPython size={36} className="text-[#3e7fb1]" /> },
    {
      name: "FastApi",
      icon: <SiFastapi size={36} className="text-[#05998b]" />,
    },
    {
      name: "Tailwind",
      icon: <SiTailwindcss size={36} className="text-[#38bdf8]" />,
    },
  ];
  return (
    <div className="bg-color-bg flex-col items-center justify-center  flex h-full w-full">
      <div className="appNameContainer">
        <h2>ChatWave</h2>
        <h2>ChatWave</h2>
      </div>
      <div className="mt-20 text-white">
        <h3 className="text-4xl mb-5 w-[20vw]">Built using:</h3>
        <ul className="flex text-2xl flex-col px-5 technologies">
          {technologies.map((technology) => (
            <li
              className="flex text-transparent bg-clip-text bg-white flex-col mb-2 technology"
              key={technology.name}
            >
              <div className="flex justify-between">
                {technology.name} {technology.icon}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AboutPage;
