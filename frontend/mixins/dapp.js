import Dapp from "@/lib/dapp";


export default {
  mounted() {
    this.dapp = new Dapp();
    this.dapp.initialize(this.ready());
  },
};
