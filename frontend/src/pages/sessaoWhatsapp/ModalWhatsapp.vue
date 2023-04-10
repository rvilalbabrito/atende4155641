<template>
  <q-dialog
    :value="modalWhatsapp"
    @hide="fecharModal"
    @show="abrirModal"
    persistent
  >
    <q-card
      class="q-pa-md"
      style="width: 500px"
    >
      <q-card-section>
        <div class="text-h6">
          <q-icon
            size="50px"
            class="q-mr-md"
            :name="`img:${whatsapp.type}-logo.png`"
          /> {{ whatsapp.id ? 'Editar' : 'Adicionar' }} Canal
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12">
            <c-input
              outlined
              label="Nome"
              v-model="whatsapp.name"
              :validator="$v.whatsapp.name"
              @blur="$v.whatsapp.name.$touch"
            />
          </div>
          <template v-if="whatsapp.type === 'messenger'">
            <VFacebookLogin
              :app-id="cFbAppId"
              @sdk-init="handleSdkInit"
              @login="fbLogin"
              :login-options="FBLoginOptions"
              version="v12.0"
            />

          </template>
          <!-- <q-checkbox
            class="q-ml-md"
            v-model="whatsapp.isDefault"
            label="Padrão"
          /> -->
        </div>
        <div class="row q-my-md">
            <div class="col-12">
                <label class="text-caption">Mensagem de Saudação do Atendimento:</label>
                <textarea
                  ref="inputGreetingMessage"
                  style="min-height: 15vh; max-height: 15vh;"
                  class="q-pa-sm bg-white full-width"
                  placeholder="Digite a mensagem"
                  autogrow
                  dense
                  outlined
                  @input="(v) => whatsapp.greetingMessage = v.target.value"
                  :value="whatsapp.greetingMessage"
                />
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <label class="text-caption">Mensagem de Despedida do Atendimento:</label>
                <textarea
                  ref="inputFarewellMessage"
                  style="min-height: 15vh; max-height: 15vh;"
                  class="q-pa-sm bg-white full-width"
                  placeholder="Digite a mensagem"
                  autogrow
                  dense
                  outlined
                  @input="(v) => whatsapp.farewellMessage = v.target.value"
                  :value="whatsapp.farewellMessage"
                />
            </div>
            <div v-html="' Variáveis: <br>{{nomecontato}}  {{nomeatendente}}  {{atendimentonumero}}  {{saudacao}}'" />
        </div>
      </q-card-section>
      <q-card-actions
        align="center"
        class="q-mt-lg"
      >
        <q-btn
          flat
          label="Sair"
          class="q-px-md q-mr-lg"
          color="negative"
          v-close-popup
        />
        <q-btn
          flat
          label="Salvar"
          color="primary"
          class="q-px-md"
          @click="handleSaveWhatsApp(whatsapp)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>
import { required, minLength, maxLength } from 'vuelidate/lib/validators'
import { UpdateWhatsapp, CriarWhatsapp } from 'src/service/sessoesWhatsapp'
import cInput from 'src/components/cInput.vue'
import { copyToClipboard } from 'quasar'

export default {
  components: { cInput },
  name: 'ModalWhatsapp',
  props: {
    modalWhatsapp: {
      type: Boolean,
      default: false
    },
    whatsAppId: {
      type: Number,
      default: null
    },
    whatsAppEdit: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      isPwd: true,
      isEdit: false,
      whatsapp: {
        name: '',
        isDefault: false,
        tokenAPI: '',
        greetingMessage: '',
        farewellMessage: ''
      }
    }
  },
  validations: {
    whatsapp: {
      name: { required, minLength: minLength(3), maxLength: maxLength(50) },
      isDefault: {}
    }
  },
  computed: {
    cBaseUrlIntegração () {
      return this.whatsapp.UrlMessengerWebHook
    }
  },
  methods: {
    copy (text) {
      copyToClipboard(text)
        .then(this.$notificarSucesso('URL de integração copiada!'))
        .catch()
    },

    fecharModal () {
      this.whatsapp = {
        name: '',
        greetingMessage: '',
        farewellMessage: '',
        isDefault: false
      }
      this.$emit('update:whatsAppEdit', {})
      this.$emit('update:modalWhatsapp', false)
    },
    abrirModal () {
      if (this.whatsAppEdit.id) {
        this.whatsapp = { ...this.whatsAppEdit }
      }
    },
    async handleSaveWhatsApp (whatsapp) {
      this.$v.whatsapp.$touch()
      if (this.$v.whatsapp.$error) {
        return this.$q.notify({
          type: 'warning',
          progress: true,
          position: 'top',
          message: 'Ops! Verifique os erros...',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }
      try {
        if (this.whatsAppEdit.id) {
          await UpdateWhatsapp(this.whatsAppEdit.id, whatsapp)
        } else {
          await CriarWhatsapp(whatsapp)
        }
        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          message: `Whatsapp ${this.whatsAppEdit.id ? 'editado' : 'criado'} com sucesso!`,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        this.fecharModal()
      } catch (error) {
        console.error(error)
      }
    }
  },
  destroyed () {
    this.$v.whatsapp.$reset()
  }
}
</script>

<style lang="scss" scoped>
</style>
