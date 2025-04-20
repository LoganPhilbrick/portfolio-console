import video from "./assets/initbl.mp4";
import "./App.css";
// import AsciiOverlay from "./components/AsciiOverlay";

function App() {
  return (
    <div>
      <div className="relative flex justify-center w-full h-screen overflow-hidden bg-black font-mono text-xs leading-none text-white">
        <video
          className="absolute top-0 w-full h-full object-cover z-10"
          autoPlay
          muted
          loop
          playsInline
          src={video} // Replace with actual video source
        />
      </div>
      {/* <AsciiOverlay /> */}
    </div>
  );
}

export default App;
