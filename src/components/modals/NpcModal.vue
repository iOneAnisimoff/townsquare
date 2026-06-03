<template>
  <Modal v-if="isDisplayed" @close="toggleModal('npc')">
    <h3>Выберите персонажа для добавления в игру:</h3>
    <ul class="tokens">
      <li v-for="role in displayedRoles" :key="role.id" @click="setNpcs(role)">
        <Token :role="role" />
      </li>
    </ul>
    <div class="button-group">
      <span
        class="button"
        :class="{ townsfolk: type === 'fabled' }"
        @click="type = 'fabled'"
      >
        Легендарные
      </span>
      <span
        class="button"
        :class="{ townsfolk: type === 'loric' }"
        @click="type = 'loric'"
      >
        Лорик
      </span>
    </div>
  </Modal>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import Modal from "./Modal";
import Token from "../Token";

export default {
  components: { Token, Modal },
  computed: {
    ...mapState(["modals", "npcs", "otherNpcs", "grimoire"]),
    isDisplayed() {
      return this.modals.npc && this.availableRoles.length;
    },
    displayedRoles() {
      return this.availableRoles(this.type);
    },
  },
  data() {
    return {
      type: "fabled",
    };
  },
  methods: {
    availableRoles(type) {
      const characters = [];
      this.otherNpcs.forEach((role) => {
        // don't show npcs that are already in play
        if (
          (((!type || type === "fabled") && role.team === "fabled") ||
            ((!type || type === "loric") && role.team === "loric")) &&
          !this.npcs.some((npc) => npc.id === role.id)
        ) {
          characters.push(role);
        }
      });
      return characters;
    },
    setNpcs(role) {
      this.$store.commit("setNpcs", {
        npcs: role,
      });
      this.$store.commit("toggleModal", "npc");
    },
    ...mapMutations(["toggleModal"]),
  },
};
</script>

<style scoped lang="scss">
@import "../../vars.scss";

ul.tokens li {
  border-radius: 50%;
  width: 8vw;
  margin: 0.5%;
  transition: transform 500ms ease;

  @media (orientation: portrait) {
    width: 8vh;
  }

  &:hover {
    transform: scale(1.2);
    z-index: 10;
  }
}
</style>
