import AmbientCircle from "./AmbientCircle";


export default function AmbientBackground() {
  return (
    <>
      <div className="scanline" />
      <AmbientCircle
        color="rgba(180,0,255,0.08)"
        size={400}
        xSpeed={0.05}
        ySpeed={0.05}
        startX={-80}
        startY={60}
      />
      <AmbientCircle
        color="rgba(0,245,255,0.08)"
        size={350}
        xSpeed={-0.05}
        ySpeed={-0.05}
        startX={-40}
        startY={-60}
        right={true}
        bottom={true}
      />
    </>
  );
}
