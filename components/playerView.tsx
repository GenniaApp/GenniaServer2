import { FiUsers } from "react-icons/fi";

interface PlayerViewProps {
  maxPlayerNum: number;
}

const PlayerView = ({ maxPlayerNum }: PlayerViewProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-bold text-gray-700">
          <FiUsers className="inline-block mr-2" />
          Players
        </div>
      </div>
      <div className="bg-gray-100 rounded-lg px-4 py-6 mb-4">
        <div className="flex flex-col">
          {Array.from({ length: maxPlayerNum }, (_, i) => (
            <div
              key={i}
              className="flex items-center py-2 border-b border-gray-200"
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-4"></div>
              <div className="text-gray-700">Player {i + 1}</div>
            </div>
          ))}
        </div>
      </div>
      <button className="w-full bg-black text-white py-4 rounded-lg mb-4">
        Force Start (0/{maxPlayerNum})
      </button>
    </>
  );
};

export default PlayerView;
