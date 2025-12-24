import Text from "~/components/authoring/Text/Text";
import Embed from "~/components/authoring/Embed/Embed";
import Container from "~/components/authoring/Container/Container";
import Image from "~/components/authoring/Image/Image";
import Link from "~/components/authoring/Link/Link";
import YouTube from "~/components/authoring/YouTube/YouTube";

const COMPONENT_REGISTRY = {
  Container: Container,
  Embed: Embed,
  Image: Image,
  Link: Link,
  Text: Text,
  YouTube: YouTube,
};

export default COMPONENT_REGISTRY;
