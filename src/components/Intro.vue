<template>
  <div class="intro">
    <img src="static/apple-icon.png" alt="" class="logo" />
    <div>
      Добро пожаловать в (неофициальную)
      <b>Виртуальную Городскую Площадь и Гримуар</b> для Blood on the
      Clocktower! Пожалуйста, добавьте игроков через
      <span class="button" @click="toggleMenu">
        <font-awesome-icon icon="cog" /> Меню
      </span>
      в правом верхнем углу или нажав <b>[A]</b>. Вы также можете присоединиться
      к игровой сессии, нажав <b>[J]</b>.<br />
      <div class="footer">
        Этот проект бесплатный и с открытым исходным кодом, его можно найти на
        <a href="https://github.com/nicholas-eden/townsquare" target="_blank"
          >GitHub</a
        >. Проект не связан с The Pandemonium Institute. «Blood on the
        Clocktower» является торговой маркой Steven Medway и The Pandemonium
        Institute.
      </div>
    </div>
    <img src="../assets/community-created-content.webp" alt="" class="ccc" />
    <a
      class="redirect"
      v-if="language === 'zh-CN'"
      href="https://clocktower.gstonegames.com"
    >
      <img src="../assets/gstone.webp" class="gstone" alt="" />
      你想使用中文版魔典吗？
    </a>
  </div>
</template>

<script>
import { mapMutations } from "vuex";

export default {
  data() {
    return {
      language: window.navigator.userLanguage || window.navigator.language,
    };
  },
  methods: mapMutations(["toggleMenu"]),
};
</script>

<style scoped lang="scss">
.intro {
  text-align: center;
  width: 50%;
  font-size: 120%;
  position: absolute;
  padding: 10px;
  background: rgba(0, 0, 0, 0.5);
  border: 3px solid black;
  border-radius: 10px;
  z-index: 3;
  display: flex;
  justify-content: center;
  a {
    color: white;
  }
  a.redirect {
    display: block;
    text-decoration: none;
    position: absolute;
    top: 100%;
    margin-top: 2vh;
    padding: 10px;
    background: rgba(0, 0, 0, 0.5);
    border: 3px solid black;
    border-radius: 10px;

    &:hover {
      color: red;
    }
    img {
      width: 120px;
      display: block;
      margin: auto auto 1vh;
    }
  }

  img.logo {
    position: absolute;
    bottom: 100%;
    width: 25vh;
    margin-bottom: 2vh;
    max-width: 192px;
    border-radius: 50%;
    box-shadow: 0 0 10px black;
    border: 3px solid black;
  }

  img.ccc {
    position: absolute;
    top: 100%;
    width: 25vh;
    margin-top: 2vh;
    max-width: 192px;
    filter: drop-shadow(0 0 10px black);
  }

  .footer {
    font-size: 60%;
    opacity: 0.75;
  }
}
</style>
