import {YouTube} from "~/components/authoring/YouTube/YouTube";
import {DemoContainer} from "~/routes/demo/DemoContainer";

export default function YouTubeDemo() {
  return (
    <>
      <DemoContainer title="Default - Responsive 16:9 (Full Width)">
        <YouTube
          videoId="fiKG2Yb9goc"
          title="Default responsive video"
        />
      </DemoContainer>

      <DemoContainer title="4:3 Aspect Ratio - Classic TV Format">
        <YouTube
          videoId="H5Z3GBdyg2Q"
          aspectRatio="4:3"
          title="Classic format"
        />
      </DemoContainer>

      <DemoContainer title="Fixed Width & Height - 640x360">
        <YouTube
          videoId="dVxaDbgH7WQ"
          width="640px"
          height="360px"
          aspectRatio="none"
          title="Fixed size video"
        />
      </DemoContainer>

      <DemoContainer title="Square Aspect Ratio (1:1) - Responsive">
        <YouTube
          videoId="tpsP8LMuu_M"
          aspectRatio="1:1"
          title="Square video"
        />
      </DemoContainer>

      <DemoContainer title="Custom Width with Container - 50% Width">
        <div className="w-1/2">
          <YouTube
            videoId="iId5WDsYxZ4"
            aspectRatio="16:9"
            title="Half width responsive"
          />
        </div>
      </DemoContainer>

      <DemoContainer title="Wide Screen Format (21:9) - Responsive">
        <YouTube
          videoId="WSLMN6g_Od4"
          aspectRatio="21:9"
          title="Ultra-wide format"
        />
      </DemoContainer>
    </>
  );
}

