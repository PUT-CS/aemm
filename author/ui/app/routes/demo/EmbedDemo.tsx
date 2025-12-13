import Embed from "~/components/authoring/Embed/Embed";
import { DemoContainer } from "~/routes/demo/DemoContainer";

export default function EmbedDemo() {
  return (
    <>
      <DemoContainer title="Vimeo Video - Responsive 16:9">
        <Embed
          src="https://player.vimeo.com/video/148751763"
          aspectRatio="16:9"
          title="Vimeo video"
        />
      </DemoContainer>

      <DemoContainer title="CodePen Embed - Responsive 16:9">
        <Embed
          src="https://codepen.io/team/codepen/embed/preview/PNaGbb"
          aspectRatio="16:9"
          title="CodePen demo"
        />
      </DemoContainer>

      <DemoContainer title="Google Maps - Fixed Size 600x450">
        <Embed
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d759.9270021722167!2d16.83908464055833!3d52.32969440947194!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47044fc377af45d5%3A0xe86d4c329587d64!2sCzere%C5%9Bniowa%2010%2C%2062-051%20Wiry!5e1!3m2!1spl!2spl!4v1763660194046!5m2!1spl!2spl"
          width="600px"
          height="450px"
          aspectRatio="none"
          title="Google Maps"
        />
      </DemoContainer>

      <DemoContainer title="Spotify Embed - Fixed Size 400x380">
        <Embed
          src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M"
          width="400px"
          height="380px"
          aspectRatio="none"
          title="Spotify playlist"
        />
      </DemoContainer>

      <DemoContainer title="Google Slides - Responsive 16:9">
        <Embed
          src="https://docs.google.com/presentation/d/e/2PACX-1vQoKYgKfHr0WXmYN8KVRn8YXLCz0jCQl8C9Jz8Jz8Jz8Jz8/embed"
          aspectRatio="16:9"
          title="Google Slides presentation"
          allowFullscreen={false}
        />
      </DemoContainer>

      <DemoContainer title="SoundCloud - Fixed Size 100% x 166px">
        <Embed
          src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/34019569"
          width="100%"
          height="166px"
          aspectRatio="none"
          title="SoundCloud track"
        />
      </DemoContainer>

      <DemoContainer title="Twitter/X Embed - Fixed Size 550x250">
        <Embed
          src="https://platform.twitter.com/embed/index.html?dnt=true"
          width="550px"
          height="250px"
          aspectRatio="none"
          title="Twitter embed"
        />
      </DemoContainer>
    </>
  );
}
