<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeModal">
    <div class="bg-main-800 border border-main-400 rounded-lg shadow-lg w-[800px] max-w-[90vw] max-h-[90vh] overflow-hidden mx-4 relative" @click.stop>
      <!-- Close X Button -->
      <button
        @click="closeModal"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer z-10"
        title="Close"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <div class="overflow-y-auto max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-4 bg-main-900 border-b border-main-600">
          <div class="flex items-center justify-between pr-8">
            <div class="flex items-center">
              <div>
                <h2 v-if="!editing.name" class="text-xl font-semibold text-gray-100">{{ server.name }}</h2>
                <div v-else class="flex items-center space-x-2">
                  <input
                    v-model="editForm.name"
                    type="text"
                    class="text-xl font-semibold bg-main-700 border border-main-500 text-gray-100 rounded px-2 py-1 focus:outline-none focus:border-main-400"
                    @keyup.enter="saveName"
                    @keyup.escape="cancelEdit('name')"
                  />
                  <button
                    @click="saveName"
                    :disabled="saving.name"
                    class="px-3 py-1 text-sm bg-green-700 hover:bg-green-600 text-gray-100 rounded transition-colors disabled:opacity-50"
                  >
                    {{ saving.name ? 'Saving...' : 'Save' }}
                  </button>
                  <button
                    @click="cancelEdit('name')"
                    class="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-100 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                <div class="flex items-center space-x-4 mt-1">
                  <span v-if="server._id" class="text-sm text-gray-400">ID: {{ server._id }}</span>
                </div>
              </div>
            </div>
            <div v-if="canEdit && !editing.name" class="flex items-center space-x-2">
              <button
                @click="startEdit('name')"
                class="px-3 py-1.5 text-xs font-medium text-gray-300 bg-main-700 hover:bg-main-600 border border-main-500 hover:border-main-400 rounded-md hover:text-gray-100 transition-colors"
              >
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit Name
              </button>
            </div>
          </div>
        </div>

        <!-- Owner Information -->
        <div class="px-6 py-4 border-b border-main-600">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-300 mb-1">Server Owner</h3>
              <div v-if="!editing.owner" class="flex items-center">
                <span
                  v-if="server.user"
                  class="text-gray-100 cursor-pointer hover:text-gray-200 hover:bg-main-700 px-2 py-1 rounded transition-colors"
                  @click="copyToClipboard(server.user.steam_id)"
                  :title="`Click to copy Steam ID: ${server.user.steam_id}`"
                >
                  {{ server.user.username || 'Unknown User' }} ({{ server.user.steam_id }})
                </span>
                <span v-else class="text-gray-100">Not set</span>
              </div>
              <div v-else class="flex items-center space-x-2">
                <input
                  v-model="editForm.owner"
                  type="text"
                  placeholder="Steam ID"
                  class="bg-main-700 border border-main-500 text-gray-100 rounded px-2 py-1 focus:outline-none focus:border-main-400 monospace"
                  @keyup.enter="saveOwner"
                  @keyup.escape="cancelEdit('owner')"
                />
                <button
                  @click="saveOwner"
                  :disabled="saving.owner"
                  class="px-3 py-1 text-sm bg-green-700 hover:bg-green-600 text-gray-100 rounded transition-colors disabled:opacity-50"
                >
                  {{ saving.owner ? 'Saving...' : 'Save' }}
                </button>
                <button
                  @click="cancelEdit('owner')"
                  class="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-100 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            <div v-if="canEdit && !editing.owner">
              <button
                @click="startEdit('owner')"
                class="px-3 py-1.5 text-xs font-medium text-gray-300 bg-main-700 hover:bg-main-600 border border-main-500 hover:border-main-400 rounded-md hover:text-gray-100 transition-colors"
              >
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit Owner
              </button>
            </div>
          </div>
        </div>

        <!-- API Key Section -->
        <div v-if="canManageKeys" class="px-6 py-4 border-b border-main-600">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-100">API Key Management</h3>
            <button
              @click="toggleApiKeySection"
              class="px-3 py-1.5 text-sm font-medium text-gray-100 bg-blue-700 hover:bg-blue-600 rounded-md transition-colors"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      :d="showApiKeySection ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'"/>
              </svg>
              {{ showApiKeySection ? 'Hide' : 'Show' }} API Key
            </button>
          </div>

          <!-- API Key Details (Should this be collapsible?) -->
          <div v-if="showApiKeySection" class="space-y-4">
            <!-- Loading State -->
            <div v-if="loadingKeyInfo" class="flex items-center justify-center py-8">
              <loadWheel class="w-6 h-6 mr-2"></loadWheel>
              <span class="text-gray-400">Loading API key information...</span>
            </div>

            <!-- Key Info -->
            <div v-else-if="currentServerKeyInfo" class="space-y-4">
              <!-- API Key Display -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                <div class="relative">
                  <div
                    @click="copyApiKey"
                    class="w-full px-3 py-2 bg-main-900 border border-main-600 rounded-md cursor-pointer hover:bg-main-800 transition-colors group"
                    title="Click to copy API key"
                  >
                    <code class="text-sm text-gray-100 monospace blur-sm">{{ currentServerKeyInfo.key }}</code>
                  </div>
                  <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span class="text-xs text-gray-400 bg-main-800 px-2 py-1 rounded border border-main-600 group-hover:text-gray-300 transition-colors">
                      <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                      Click to copy API key
                    </span>
                  </div>
                </div>
              </div>

              <!-- Permissions Form -->
              <form @submit.prevent="updateKey">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-300 mb-2">Permissions</label>
                  <p class="text-xs text-gray-400 mb-3">Select the permissions for this server's API key.</p>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input
                        v-model="editKeyForm.submitTimes"
                        type="checkbox"
                        class="rounded border-main-600 text-green-500 bg-main-900 focus:outline-none focus:ring-0"
                        :disabled="updatingKey"
                      />
                      <span class="ml-2 text-sm text-gray-200">Submit Times</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        v-model="editKeyForm.submitBulk"
                        type="checkbox"
                        class="rounded border-main-600 text-green-500 bg-main-900 focus:outline-none focus:ring-0"
                        :disabled="updatingKey"
                      />
                      <span class="ml-2 text-sm text-gray-200">Submit Bulk</span>
                    </label>
                  </div>
                </div>

                <div class="flex justify-between items-center">
                  <button
                    type="button"
                    @click="confirmDeleteKey"
                    :disabled="deletingKey"
                    class="px-4 py-2 text-sm font-medium text-gray-100 bg-red-700 hover:bg-red-600 rounded-md transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {{ deletingKey ? 'Deleting...' : 'Delete Key' }}
                  </button>

                  <button
                    type="submit"
                    :disabled="updatingKey"
                    class="px-4 py-2 text-sm font-medium text-gray-100 bg-blue-700 hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {{ updatingKey ? 'Updating...' : 'Update Permissions' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- No Key Found -->
            <div v-else class="text-center py-8">
              <p class="text-gray-400 text-sm">No API key found for this server.</p>
            </div>
          </div>
        </div>

        <!-- Servers Section -->
        <div class="px-6 py-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-100">Servers</h3>
            <div v-if="canEdit" class="flex items-center space-x-2">
              <button
                @click="addServer"
                class="px-3 py-1.5 text-sm font-medium text-gray-100 bg-green-700 hover:bg-green-600 rounded-md transition-colors"
              >
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Add Server
              </button>
            </div>
          </div>

          <!-- Servers List -->
          <div v-if="localServers.length === 0" class="text-center py-8 text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/>
            </svg>
            <p>No servers configured</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(server, index) in localServers"
              :key="index"
              class="bg-main-700 rounded-lg p-4 border border-main-600"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center mb-2 flex-wrap gap-2">
                    <h4 class="text-base font-medium text-gray-100">{{ server.name }}</h4>
                    <span
                      :class="[
                        'px-2 py-1 text-xs font-medium rounded-full',
                        server.whitelist
                          ? 'bg-yellow-900 text-yellow-400'
                          : 'bg-green-900 text-green-400'
                      ]"
                    >
                      {{ server.whitelist ? 'Whitelist' : 'Public' }}
                    </span>
                    <span
                      v-if="server.password"
                      class="px-2 py-1 text-xs font-medium rounded-full bg-orange-900 text-orange-400"
                      title="Password Protected"
                    >
                      Password
                    </span>
                    <span
                      v-if="server.vac_secure"
                      class="px-2 py-1 text-xs font-medium rounded-full bg-blue-900 text-blue-400"
                      title="VAC Secure"
                    >
                      VAC
                    </span>
                  </div>
                  <div class="flex items-center">
                    <span
                      class="text-sm text-gray-200 monospace cursor-pointer hover:text-gray-100 transition-colors"
                      @click="copyToClipboard(server.ip)"
                      :title="`Click to copy ${server.ip}`"
                    >
                      {{ server.ip }}
                    </span>
                  </div>
                </div>
                <div v-if="canEdit" class="flex items-center space-x-2 ml-4">
                  <button
                    @click="editServer(index)"
                    class="px-2 py-1 text-xs font-medium text-gray-300 bg-main-600 hover:bg-main-500 border border-main-500 hover:border-main-400 rounded transition-colors"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button
                    @click="removeServer(index)"
                    :disabled="saving.servers"
                    class="px-2 py-1 text-xs font-medium text-gray-300 bg-red-700 hover:bg-red-600 rounded transition-colors disabled:opacity-50"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Server Edit Modal -->
    <div v-if="showServerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60" @click="closeServerModal">
      <div class="bg-main-800 border border-main-400 rounded-lg shadow-lg p-6 w-[500px] max-w-[90vw] mx-4 relative" @click.stop>
        <button
          @click="closeServerModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
          title="Close"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <h3 class="text-lg font-semibold mb-4 text-gray-100">
          {{ editingServerIndex === -1 ? 'Add Server' : 'Edit Server' }}
        </h3>

        <form @submit.prevent="saveServer">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">Server Name</label>
            <input
              v-model="serverForm.name"
              type="text"
              class="w-full px-3 py-2 bg-main-900 border border-main-600 text-gray-100 rounded-md focus:outline-none focus:border-main-400 transition-colors"
              placeholder="Enter server name"
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">IP Address</label>
            <input
              v-model="serverForm.ip"
              type="text"
              class="w-full px-3 py-2 bg-main-900 border border-main-600 text-gray-100 rounded-md focus:outline-none focus:border-main-400 transition-colors monospace"
              placeholder="192.168.1.100:27015"
              required
            />
          </div>

          <div class="mb-6">
            <div class="space-y-3">
              <div>
                <label class="flex items-center">
                  <input
                    v-model="serverForm.whitelist"
                    type="checkbox"
                    class="rounded border-main-600 text-green-500 bg-main-900 focus:outline-none focus:ring-0"
                  />
                  <span class="ml-2 text-sm text-gray-200">Whitelist Only</span>
                </label>
                <p class="text-xs text-gray-400 mt-1 ml-6">If enabled, only whitelisted players can access this server</p>
              </div>

              <div>
                <label class="flex items-center">
                  <input
                    v-model="serverForm.password"
                    type="checkbox"
                    class="rounded border-main-600 text-green-500 bg-main-900 focus:outline-none focus:ring-0"
                  />
                  <span class="ml-2 text-sm text-gray-200">Password Protected</span>
                </label>
                <p class="text-xs text-gray-400 mt-1 ml-6">Server requires a password to join</p>
              </div>

              <div>
                <label class="flex items-center">
                  <input
                    v-model="serverForm.vac_secure"
                    type="checkbox"
                    class="rounded border-main-600 text-green-500 bg-main-900 focus:outline-none focus:ring-0"
                  />
                  <span class="ml-2 text-sm text-gray-200">VAC Secure</span>
                </label>
                <p class="text-xs text-gray-400 mt-1 ml-6">Server has Valve Anti-Cheat enabled</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeServerModal"
              class="px-4 py-2 text-sm font-medium text-gray-100 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving.servers"
              class="px-4 py-2 text-sm font-medium text-gray-100 bg-green-700 hover:bg-green-600 rounded-md transition-colors disabled:opacity-50"
            >
              {{ saving.servers ? 'Saving...' : (editingServerIndex === -1 ? 'Add Server' : 'Update Server') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete API Key Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60" @click="cancelDeleteKey">
      <div class="bg-main-800 border border-red-400 rounded-lg shadow-lg p-6 w-[500px] max-w-[90vw] mx-4 relative" @click.stop>
        <!-- Close X Button -->
        <button
          @click="cancelDeleteKey"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
          title="Close"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <h3 class="text-lg font-semibold mb-4 text-red-400">⚠️ Delete API Key</h3>
        <div class="mb-4">
          <p class="text-sm text-gray-300 mb-2">
            Are you sure you want to delete the API key for
            <span class="font-semibold text-gray-100">{{ currentServerKeyInfo?.server }}</span>?
          </p>
          <p class="text-xs text-red-400">
            This action cannot be undone. The server will lose access immediately and a new key will need to be created.
          </p>
        </div>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="executeDeleteKey"
            :disabled="deletingKey"
            class="px-4 py-2 text-sm font-medium text-gray-100 bg-red-700 hover:bg-red-600 rounded-md transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {{ deletingKey ? 'Deleting...' : 'Yes, Delete Key' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <Toast
      :show="showToast"
      :type="toastType"
      :title="toastTitle"
      :message="toastMessage"
      @close="closeToast"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import OffstylesApi, { type ServerDataDocument, type ServerInfo, type ServerKeyInfo } from '@/api/offstylesApi';
import { KeyPermissions, addPermission } from '@/utils/permissions';
import { canManageApiKeys } from '@/utils/userPermissions';
import { useAuth } from '@/stores/auth';
import Toast from '@/components/Toast.vue';
import loadWheel from '@/components/icons/loadWheel.vue';

// Props
interface Props {
  server: ServerDataDocument;
  show: boolean;
}

const props = defineProps<Props>();

// Emits
interface Emits {
  (e: 'close'): void;
  (e: 'updated', server: ServerDataDocument): void;
}

const emit = defineEmits<Emits>();

// Auth
const { user } = useAuth();

// Check if user can edit this server (owner or admin)
const canEdit = computed(() => {
  if (!user.value) return false;
  // Check if user is the owner or has admin permissions
  return (props.server.user && user.value.steam_id === props.server.user.steam_id) || canManageApiKeys(user.value.permissions);
});

// Check if user has admin permissions for API key management
const canManageKeys = computed(() => {
  return user.value && canManageApiKeys(user.value.permissions);
});

// Reactive data
const localServers = ref<ServerInfo[]>(Array.isArray(props.server.servers) ? [...props.server.servers] : []);
const editing = ref({
  name: false,
  owner: false
});

const saving = ref({
  name: false,
  owner: false,
  servers: false
});

const editForm = ref({
  name: props.server.name,
  owner: props.server.user?.steam_id || ''
});

// Server modal
const showServerModal = ref(false);
const editingServerIndex = ref(-1);
const serverForm = ref({
  name: '',
  ip: '',
  whitelist: false,
  password: false,
  vac_secure: false
});

// Toast state
const showToast = ref(false);
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('info');
const toastTitle = ref('');
const toastMessage = ref('');

// API Key management state
const showApiKeySection = ref(false);
const currentServerKeyInfo = ref<ServerKeyInfo | null>(null);
const loadingKeyInfo = ref(false);
const updatingKey = ref(false);
const deletingKey = ref(false);
const showDeleteConfirm = ref(false);

const editKeyForm = ref({
  server: props.server.name,
  submitTimes: false,
  submitBulk: false
});

// Watch for server prop changes
watch(() => props.server, (newServer) => {
  if (newServer) {
    localServers.value = Array.isArray(newServer.servers) ? [...newServer.servers] : [];
    editForm.value.name = newServer.name || '';
    editForm.value.owner = newServer.user?.steam_id || '';
  }
}, { deep: true });

// Methods
const closeModal = () => {
  emit('close');
};

const startEdit = (field: 'name' | 'owner') => {
  editing.value[field] = true;
};

const cancelEdit = (field: 'name' | 'owner') => {
  editing.value[field] = false;
  if (field === 'name') {
    editForm.value.name = props.server.name;
  } else if (field === 'owner') {
    editForm.value.owner = props.server.user?.steam_id || '';
  }
};

const saveName = async () => {
  if (!editForm.value.name.trim() || !props.server._id) return;

  try {
    saving.value.name = true;
    const updatedServer = await OffstylesApi.updateServerName(props.server._id, editForm.value.name);
    emit('updated', updatedServer);
    editing.value.name = false;
    showToastMessage('success', 'Success', 'Server name updated successfully');
  } catch (error) {
    showToastMessage('error', 'Error', error instanceof Error ? error.message : 'Failed to update server name');
    console.error('Failed to update server name:', error);
  } finally {
    saving.value.name = false;
  }
};

const saveOwner = async () => {
  if (!editForm.value.owner.trim() || !props.server._id) return;

  try {
    saving.value.owner = true;
    const updatedServer = await OffstylesApi.updateServerOwner(props.server._id, editForm.value.owner);
    emit('updated', updatedServer);
    editing.value.owner = false;
    showToastMessage('success', 'Success', 'Server owner updated successfully');
  } catch (error) {
    showToastMessage('error', 'Error', error instanceof Error ? error.message : 'Failed to update server owner');
    console.error('Failed to update server owner:', error);
  } finally {
    saving.value.owner = false;
  }
};

const addServer = () => {
  editingServerIndex.value = -1;
  serverForm.value = {
    name: '',
    ip: '',
    whitelist: false,
    password: false,
    vac_secure: false
  };
  showServerModal.value = true;
};

const editServer = (index: number) => {
  editingServerIndex.value = index;
  const server = localServers.value[index];
  serverForm.value = {
    name: server.name,
    ip: server.ip,
    whitelist: server.whitelist,
    password: server.password,
    vac_secure: server.vac_secure
  };
  showServerModal.value = true;
};

const closeServerModal = () => {
  showServerModal.value = false;
  editingServerIndex.value = -1;
  serverForm.value = {
    name: '',
    ip: '',
    whitelist: false,
    password: false,
    vac_secure: false
  };
};

const saveServer = async () => {
  if (!props.server._id) return;

  try {
    saving.value.servers = true;

    const newServers = [...localServers.value];

    if (editingServerIndex.value === -1) {
      // Adding new server
      newServers.push({ ...serverForm.value });
    } else {
      // Editing existing server
      newServers[editingServerIndex.value] = { ...serverForm.value };
    }

    const updatedServers = await OffstylesApi.updateServerSubservers(props.server._id, newServers);
    localServers.value = updatedServers;

    // Update the parent component
    const updatedServer = { ...props.server, servers: updatedServers };
    emit('updated', updatedServer);

    closeServerModal();
    showToastMessage('success', 'Success', editingServerIndex.value === -1 ? 'Server added successfully' : 'Server updated successfully');
  } catch (error) {
    showToastMessage('error', 'Error', error instanceof Error ? error.message : 'Failed to save server');
    console.error('Failed to save server:', error);
  } finally {
    saving.value.servers = false;
  }
};

const removeServer = async (index: number) => {
  if (!props.server._id) return;

  try {
    saving.value.servers = true;

    const newServers = localServers.value.filter((_, i) => i !== index);
    const updatedServers = await OffstylesApi.updateServerSubservers(props.server._id, newServers);
    localServers.value = updatedServers;

    // Update the parent component
    const updatedServer = { ...props.server, servers: updatedServers };
    emit('updated', updatedServer);

    showToastMessage('success', 'Success', 'Server removed successfully');
  } catch (error) {
    showToastMessage('error', 'Error', error instanceof Error ? error.message : 'Failed to remove server');
    console.error('Failed to remove server:', error);
  } finally {
    saving.value.servers = false;
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    showToastMessage('success', 'Copied!', `${text} copied to clipboard`);
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToastMessage('success', 'Copied!', `${text} copied to clipboard`);
  }
};

// API Key management functions
const loadApiKeyInfo = async () => {
  if (!props.server.name) return;

  try {
    loadingKeyInfo.value = true;
    const keyInfo = await OffstylesApi.getServerKeyInfo(props.server.name);
    currentServerKeyInfo.value = keyInfo;

    // Set permissions checkboxes based on current key permissions
    editKeyForm.value.submitTimes = (keyInfo.permissions & KeyPermissions.SUBMIT_TIMES) !== 0;
    editKeyForm.value.submitBulk = (keyInfo.permissions & KeyPermissions.SUBMIT_BULK) !== 0;
  } catch (err) {
    console.error('Failed to load API key info:', err);
    currentServerKeyInfo.value = null;
  } finally {
    loadingKeyInfo.value = false;
  }
};

const toggleApiKeySection = async () => {
  showApiKeySection.value = !showApiKeySection.value;

  if (showApiKeySection.value && !currentServerKeyInfo.value && !loadingKeyInfo.value) {
    await loadApiKeyInfo();
  }
};

const updateKey = async () => {
  try {
    updatingKey.value = true;

    let permissions = 0;
    if (editKeyForm.value.submitTimes) {
      permissions = addPermission(permissions, KeyPermissions.SUBMIT_TIMES);
    }
    if (editKeyForm.value.submitBulk) {
      permissions = addPermission(permissions, KeyPermissions.SUBMIT_BULK);
    }

    await OffstylesApi.updateApiKey(
      editKeyForm.value.server,
      permissions
    );

    // Reload key info to get updated data
    await loadApiKeyInfo();

    showToastMessage('success', 'Success', 'API key permissions updated successfully');
  } catch (err) {
    showToastMessage('error', 'Error', 'Failed to update API key permissions');
    console.error('Failed to update API key permissions:', err);
  } finally {
    updatingKey.value = false;
  }
};

const confirmDeleteKey = () => {
  showDeleteConfirm.value = true;
};

const cancelDeleteKey = () => {
  showDeleteConfirm.value = false;
};

const executeDeleteKey = async () => {
  if (!currentServerKeyInfo.value) return;

  try {
    deletingKey.value = true;

    await OffstylesApi.deleteApiKey(currentServerKeyInfo.value.server);

    // Clear the key info and close the section
    currentServerKeyInfo.value = null;
    showApiKeySection.value = false;
    showDeleteConfirm.value = false;

    showToastMessage('success', 'Deleted!', `API key for ${props.server.name} has been deleted`);
  } catch (err) {
    showToastMessage('error', 'Error', 'Failed to delete API key');
    console.error('Failed to delete API key:', err);
  } finally {
    deletingKey.value = false;
  }
};

const copyApiKey = async () => {
  if (currentServerKeyInfo.value?.key) {
    try {
      await navigator.clipboard.writeText(currentServerKeyInfo.value.key);
      showToastMessage('success', 'Copied!', `API key for ${props.server.name} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy API key to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentServerKeyInfo.value.key;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToastMessage('success', 'Copied!', `API key for ${props.server.name} copied to clipboard`);
    }
  }
};

const showToastMessage = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string = '') => {
  toastType.value = type;
  toastTitle.value = title;
  toastMessage.value = message;
  showToast.value = true;
};

const closeToast = () => {
  showToast.value = false;
};
</script>

<style scoped>
/* Override global focus styles to completely remove all outlines */
input[type="text"]:focus,
input[type="checkbox"]:focus,
button:focus {
  outline: none !important;
  box-shadow: none !important;
  border-color: inherit !important;
  --tw-ring-shadow: none !important;
  --tw-ring-offset-shadow: none !important;
}

/* Remove any Tailwind focus rings */
.focus\:outline-none:focus,
.focus\:ring-0:focus,
input:focus,
button:focus {
  --tw-ring-offset-width: 0px !important;
  --tw-ring-offset-color: transparent !important;
  --tw-ring-color: transparent !important;
  --tw-ring-offset-shadow: none !important;
  --tw-ring-shadow: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* Smooth transitions for hover effects */
.transition-colors {
  transition: all 0.2s ease-in-out;
}
</style>
