import AEMMComponent from "~/components/authoring/AEMMComponent";

export default class AEMMContainerComponent<T> extends AEMMComponent<T> {
  getMaxChildren() {
    return Infinity;
  }
}
