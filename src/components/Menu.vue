<template>
  <div id="controls">
    <span
      class="nomlog-summary"
      v-show="session.voteHistory.length && session.sessionId"
      @click="toggleModal('voteHistory')"
      :title="`${session.voteHistory.length} ${
        session.voteHistory.length == 1 ? 'недавняя номинация' : 'недавних номинаций'
      }`"
    >
      <font-awesome-icon icon="book-dead" />
      {{ session.voteHistory.length }}
    </span>
    <span
      class="session"
      :class="{
        spectator: session.isSpectator,
        reconnecting: session.isReconnecting,
      }"
      v-if="session.sessionId"
      @click="leaveSession"
      :title="`${session.playerCount} других игроков в этой сессии${
        session.ping ? ' (задержка ' + session.ping + 'мс)' : ''
      }`"
    >
      <font-awesome-icon icon="broadcast-tower" />
      {{ session.playerCount }}
    </span>
    <div class="menu" :class="{ open: grimoire.isMenuOpen }">
      <font-awesome-icon icon="cog" @click="toggleMenu" />
      <ul>
        <li class="tabs" :class="tab">
          <font-awesome-icon icon="book-open" @click="tab = 'grimoire'" />
          <font-awesome-icon icon="broadcast-tower" @click="tab = 'session'" />
          <font-awesome-icon
            icon="users"
            v-if="!session.isSpectator"
            @click="tab = 'players'"
          />
          <font-awesome-icon icon="theater-masks" @click="tab = 'characters'" />
          <font-awesome-icon icon="question" @click="tab = 'help'" />
        </li>

        <template v-if="tab === 'grimoire'">
          <!-- Grimoire -->
          <li class="headline">Гримуар</li>
          <li @click="toggleGrimoire" v-if="players.length">
            <template v-if="!grimoire.isPublic">Скрыть</template>
            <template v-if="grimoire.isPublic">Показать</template>
            <em>[G]</em>
          </li>
          <li @click="toggleNight" v-if="!session.isSpectator">
            <template v-if="!grimoire.isNight">Переключить на Ночь</template>
            <template v-if="grimoire.isNight">Переключить на День</template>
            <em>[S]</em>
          </li>
          <li
            @click="toggleNightOrder"
            v-if="players.length && !session.isSpectator"
          >
            Порядок ночи
            <em>
              <font-awesome-icon
                :icon="[
                  'fas',
                  grimoire.isNightOrder ? 'check-square' : 'square',
                ]"
              />
            </em>
          </li>
          <li v-if="players.length">
            Масштаб
            <em>
              <font-awesome-icon
                @click="setZoom(grimoire.zoom - 1)"
                icon="search-minus"
              />
              {{ Math.round(100 + grimoire.zoom * 10) }}%
              <font-awesome-icon
                @click="setZoom(grimoire.zoom + 1)"
                icon="search-plus"
              />
            </em>
          </li>
          <li @click="setBackground">
            Фоновое изображение
            <em><font-awesome-icon icon="image" /></em>
          </li>
          <li @click="toggleUnofficial">
            <small>Неофициальные иллюстрации</small>
            <em
              ><font-awesome-icon
                :icon="[
                  'fas',
                  grimoire.isArtUnofficial ? 'check-square' : 'square',
                ]"
            /></em>
          </li>
          <li v-if="!edition.isOfficial" @click="imageOptIn">
            <small>Показывать пользовательские изображения</small>
            <em
              ><font-awesome-icon
                :icon="[
                  'fas',
                  grimoire.isImageOptIn ? 'check-square' : 'square',
                ]"
            /></em>
          </li>
          <li @click="toggleStatic">
            Отключить анимацию
            <em
              ><font-awesome-icon
                :icon="['fas', grimoire.isStatic ? 'check-square' : 'square']"
            /></em>
          </li>
          <li @click="toggleMuted">
            Выключить звук
            <em
              ><font-awesome-icon
                :icon="['fas', grimoire.isMuted ? 'volume-mute' : 'volume-up']"
            /></em>
          </li>
        </template>

        <template v-if="tab === 'session'">
          <!-- Session -->
          <li class="headline" v-if="session.sessionId">
            {{ session.isSpectator ? "Вы играете" : "Вы ведёте" }}
          </li>
          <li class="headline" v-else>Сетевая сессия</li>
          <template v-if="!session.sessionId">
            <li @click="hostSession">Создать (Рассказчик)<em>[H]</em></li>
            <li @click="joinSession">Присоединиться (Игрок)<em>[J]</em></li>
          </template>
          <template v-else>
            <li v-if="session.ping">
              <small>
                Задержка до {{ session.isSpectator ? "Рассказчика" : "Игроков" }}
              </small>
              <em>{{ session.ping }}мс</em>
            </li>
            <li @click="copySessionUrl">
              Скопировать ссылку игрока
              <em><font-awesome-icon icon="copy" /></em>
            </li>
            <li
              v-if="!session.isSpectator && showSendCharacters"
              @click="distributeRoles"
            >
              Отправить персонажей
              <em><font-awesome-icon icon="seedling" /></em>
            </li>
            <li
              v-if="session.voteHistory.length || !session.isSpectator"
              @click="toggleModal('voteHistory')"
            >
              История голосований<em>[V]</em>
            </li>
            <li v-if="!session.isSpectator" @click="setVoteWatching">
              Тайное голосование
              <em
                ><font-awesome-icon
                  :icon="[
                    'fas',
                    !session.isVoteWatchingAllowed ? 'check-square' : 'square',
                  ]"
              /></em>
            </li>
            <li v-if="!session.isSpectator" @click="setTwoVotes">
              Голосовать дважды
              <em
                ><font-awesome-icon
                  :icon="[
                    'fas',
                    session.isTwoVotesEnabled ? 'check-square' : 'square',
                  ]"
              /></em>
            </li>
            <li @click="leaveSession">
              Покинуть сессию
              <em>{{ session.sessionId }}</em>
            </li>
          </template>
        </template>

        <template v-if="tab === 'players' && !session.isSpectator">
          <!-- Users -->
          <li class="headline">Игроки</li>
          <li @click="addPlayer" v-if="players.length < 20">
            Добавить<em>[A]</em>
          </li>
          <li v-if="!session.isSpectator" @click="toggleSelfNaming">
            Разрешить переименование
            <em
              ><font-awesome-icon
                :icon="[
                  'fas',
                  session.allowSelfNaming ? 'check-square' : 'square',
                ]"
            /></em>
          </li>
          <li @click="lowerHands" v-if="players.length">
            Опустить все руки
            <em><font-awesome-icon icon="sign-language" /></em>
          </li>
          <li @click="randomizeSeatings" v-if="players.length > 2">
            Перемешать
            <em><font-awesome-icon icon="dice" /></em>
          </li>
          <li @click="clearPlayers" v-if="players.length">
            Удалить всех
            <em><font-awesome-icon icon="trash-alt" /></em>
          </li>
        </template>

        <template v-if="tab === 'characters'">
          <!-- Characters -->
          <li class="headline">Персонажи</li>
          <li v-if="!session.isSpectator" @click="toggleModal('edition')">
            Выбрать издание
            <em>[E]</em>
          </li>
          <li
            @click="toggleModal('roles')"
            v-if="!session.isSpectator && players.length > 4"
          >
            Выбрать и назначить
            <em>[C]</em>
          </li>
          <li v-if="!session.isSpectator" @click="toggleModal('npc')">
            Добавить NPC
            <em><font-awesome-icon icon="dragon" /></em>
          </li>
          <li @click="clearRoles" v-if="players.length">
            Очистить всё
            <em><font-awesome-icon icon="trash-alt" /></em>
          </li>
        </template>

        <template v-if="tab === 'help'">
          <!-- Help -->
          <li class="headline">Помощь</li>
          <li @click="toggleModal('reference')">
            Справочный лист
            <em>[R]</em>
          </li>
          <li @click="toggleModal('nightOrder')">
            Лист порядка ночи
            <em>[N]</em>
          </li>
          <li @click="toggleModal('gameState')">
            Состояние игры (JSON)
            <em><font-awesome-icon icon="file-code" /></em>
          </li>
          <li @click="toggleMockAssignments">
            Пробное распределение
            <em
              ><font-awesome-icon
                :icon="[
                  'fas',
                  grimoire.isMockAssignmentsAllowed ? 'check-square' : 'square',
                ]"
            /></em>
          </li>
          <li>
            <small>
              <a href="https://discord.gg/botc" target="_blank">
                Неофициальный Discord
              </a>
            </small>
            <em>
              <a href="https://discord.gg/botc" target="_blank">
                <font-awesome-icon :icon="['fab', 'discord']" />
              </a>
            </em>
          </li>
          <li>
            <a
              href="https://github.com/nicholas-eden/townsquare"
              target="_blank"
            >
              Исходный код
            </a>
            <em>
              <a
                href="https://github.com/nicholas-eden/townsquare"
                target="_blank"
              >
                <font-awesome-icon :icon="['fab', 'github']" />
              </a>
            </em>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  computed: {
    showSendCharacters: function () {
      return (
        this.npcs.some((npc) => npc.id === "gardener") &&
        !this.npcs.some((npc) => npc.id === "tor")
      );
    },
    ...mapState(["grimoire", "session", "edition", "npcs"]),
    ...mapState("players", ["players"]),
  },
  data() {
    return {
      tab: "grimoire",
    };
  },
  methods: {
    setBackground() {
      const background = prompt("Введите URL фонового изображения");
      if (background || background === "") {
        this.$store.commit("setBackground", background);
      }
    },
    hostSession() {
      if (this.session.sessionId) return;
      const sessionId = prompt(
        "Введите номер / название канала для вашей сессии",
        Math.round(Math.random() * 10000),
      );
      if (sessionId) {
        this.$store.commit("session/clearVoteHistory");
        this.$store.commit("session/setSpectator", false);
        this.$store.commit("session/setSessionId", sessionId);
        this.copySessionUrl();
      }
    },
    copySessionUrl() {
      const url = window.location.href.split("#")[0];
      const link = url + "#" + this.session.sessionId;
      navigator.clipboard.writeText(link);
    },
    distributeRoles() {
      if (this.session.isSpectator) return;
      const popup =
        "Раздать назначенных персонажей всем РАССАЖЕННЫМ игрокам?";
      if (confirm(popup)) {
        this.$store.commit("session/distributeRoles", true);
        setTimeout(
          (() => {
            this.$store.commit("session/distributeRoles", false);
          }).bind(this),
          2000,
        );
      }
    },
    imageOptIn() {
      const popup =
        "Вы уверены, что хотите разрешить пользовательские изображения? Автор вредоносного файла сценария может таким образом отследить ваш IP-адрес.";
      if (this.grimoire.isImageOptIn || confirm(popup)) {
        this.toggleImageOptIn();
      }
    },
    joinSession() {
      if (this.session.sessionId) return this.leaveSession();
      let sessionId = prompt(
        "Введите номер / название канала сессии, к которой хотите присоединиться",
      );
      if (sessionId.match(/^https?:\/\//i)) {
        sessionId = sessionId.split("#").pop();
      }
      if (sessionId) {
        this.$store.commit("session/clearVoteHistory");
        this.$store.commit("session/setSpectator", true);
        this.$store.commit("toggleGrimoire", false);
        this.$store.commit("session/setSessionId", sessionId);
      }
    },
    leaveSession() {
      if (confirm("Вы уверены, что хотите покинуть активную сетевую игру?")) {
        this.$store.commit("session/setSpectator", false);
        this.$store.commit("session/setSessionId", "");
      }
    },
    addPlayer() {
      if (this.session.isSpectator) return;
      if (this.players.length >= 20) return;
      const name = prompt("Имя игрока", "Игрок " + (this.players.length + 1));
      if (name) {
        this.$store.commit("players/add", name);
      }
    },
    lowerHands() {
      if (this.session.isSpectator) return;
      this.players.forEach((player) => {
        this.$store.commit("players/update", {
          player,
          property: "handRaised",
          value: false,
        });
      });
    },
    randomizeSeatings() {
      if (this.session.isSpectator) return;
      if (confirm("Вы уверены, что хотите перемешать рассадку?")) {
        this.$store.dispatch("players/randomize");
      }
    },
    clearPlayers() {
      if (this.session.isSpectator) return;
      if (confirm("Вы уверены, что хотите удалить всех игроков?")) {
        // abort vote if in progress
        if (this.session.nomination) {
          this.$store.commit("session/nomination");
        }
        this.$store.commit("players/clear");
        this.$store.commit("setBluff");
      }
    },
    clearRoles() {
      if (confirm("Вы уверены, что хотите убрать все роли игроков?")) {
        this.$store.dispatch("players/clearRoles");
      }
    },
    toggleNight() {
      this.$store.commit("toggleNight");
      if (this.grimoire.isNight) {
        this.$store.commit("session/setMarkedPlayer", -1);
      }
    },
    toggleSelfNaming() {
      if (this.session.isSpectator) return;
      this.$store.commit(
        "session/setAllowSelfNaming",
        !this.session.allowSelfNaming,
      );
    },
    setTwoVotes() {
      if (this.session.isSpectator) return;
      this.$store.commit(
        "session/setTwoVotesEnabled",
        !this.session.isTwoVotesEnabled,
      );

      if (!this.session.isTwoVotesEnabled) {
        // Disable two votes for all players
        this.players.forEach((player) => {
          if (player.hasTwoVotes) {
            this.$store.commit("players/update", {
              player: player,
              property: "hasTwoVotes",
              value: false,
            });
          }
        });
      }
    },
    setVoteWatching() {
      if (this.session.isSpectator) return;
      this.$store.commit(
        "session/setVoteWatchingAllowed",
        !this.session.isVoteWatchingAllowed,
      );

      if (!this.session.isVoteWatchingAllowed) {
        // Disable vote history if votes are hidden
        this.$store.commit("session/setVoteHistoryAllowed", false);
      }
    },
    ...mapMutations([
      "toggleGrimoire",
      "toggleMenu",
      "toggleUnofficial",
      "toggleImageOptIn",
      "toggleMuted",
      "toggleNightOrder",
      "toggleStatic",
      "toggleMockAssignments",
      "setZoom",
      "toggleModal",
    ]),
  },
};
</script>

<style scoped lang="scss">
@import "../vars.scss";

// success animation
@keyframes greenToWhite {
  from {
    color: green;
  }
  to {
    color: white;
  }
}

// Controls
#controls {
  position: absolute;
  right: 3px;
  top: 3px;
  text-align: right;
  padding-right: 50px;
  z-index: 75;

  svg {
    filter: drop-shadow(0 0 5px rgba(0, 0, 0, 1));
    &.success {
      animation: greenToWhite 1s normal forwards;
      animation-iteration-count: 1;
    }
  }

  > span {
    display: inline-block;
    cursor: pointer;
    z-index: 5;
    margin-top: 7px;
    margin-left: 10px;
  }

  span.nomlog-summary {
    color: $townsfolk;
  }

  span.session {
    color: $demon;
    &.spectator {
      color: $townsfolk;
    }
    &.reconnecting {
      animation: blink 1s infinite;
    }
  }
}

@keyframes blink {
  50% {
    opacity: 0.5;
    color: gray;
  }
}

.menu {
  width: 220px;
  transform-origin: 200px 22px;
  transition: transform 500ms cubic-bezier(0.68, -0.55, 0.27, 1.55);
  transform: rotate(-90deg);
  position: absolute;
  right: 0;
  top: 0;

  &.open {
    transform: rotate(0deg);
  }

  > svg {
    cursor: pointer;
    background: rgba(0, 0, 0, 0.5);
    border: 3px solid black;
    width: 40px;
    height: 50px;
    margin-bottom: -8px;
    border-bottom: 0;
    border-radius: 10px 10px 0 0;
    padding: 5px 5px 15px;
  }

  a {
    color: white;
    text-decoration: none;
    &:hover {
      color: red;
    }
  }

  ul {
    display: flex;
    list-style-type: none;
    padding: 0;
    margin: 0;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 0 10px black;
    border: 3px solid black;
    border-radius: 10px 0 10px 10px;

    li {
      padding: 2px 5px;
      color: white;
      text-align: left;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 30px;

      @media (orientation: portrait) {
        font-size: 16px;
      }

      &.tabs {
        display: flex;
        padding: 0;
        svg {
          flex-grow: 1;
          flex-shrink: 0;
          height: 35px;
          border-bottom: 3px solid black;
          border-right: 3px solid black;
          padding: 5px 0;
          cursor: pointer;
          transition: color 250ms;
          &:hover {
            color: red;
          }
          &:last-child {
            border-right: 0;
          }
        }
        &.grimoire .fa-book-open,
        &.players .fa-users,
        &.settings .fa-tools,
        &.characters .fa-theater-masks,
        &.session .fa-broadcast-tower,
        &.help .fa-question {
          background: linear-gradient(
            to bottom,
            $townsfolk 0%,
            rgba(0, 0, 0, 0.5) 100%
          );
        }
      }

      &:not(.headline):not(.tabs):hover {
        cursor: pointer;
        color: red;
      }

      em {
        flex-grow: 0;
        font-style: normal;
        margin-left: 10px;
        font-size: 80%;
      }
    }

    .headline {
      font-family: PiratesBay, sans-serif;
      letter-spacing: 1px;
      padding: 0 10px;
      text-align: center;
      justify-content: center;
      background: linear-gradient(
        to right,
        $townsfolk 0%,
        rgba(0, 0, 0, 0.5) 20%,
        rgba(0, 0, 0, 0.5) 80%,
        $demon 100%
      );

      @media (orientation: portrait) {
        font-size: 16px;
      }
    }
  }
}
</style>
