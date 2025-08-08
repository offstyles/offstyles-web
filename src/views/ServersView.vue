<template>
  <main>
    <div class="flex flex-col items-center justify-center">
      <div class="w-full max-w-6xl mx-auto px-4 py-8">
        <h1 class="text-gray-100 text-xl text-center mb-8">Servers</h1>
        
        <!-- Server Statistics -->
        <div v-if="!loading && !error && servers.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-main-700 rounded-md p-4">
            <div class="flex items-center">
              <div class="p-1.5 bg-main-500 rounded-md">
                <svg class="w-5 h-5 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/>
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-xs font-medium text-gray-300">Total Servers</h3>
                <p class="text-xl font-semibold text-gray-100">{{ totalServers }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-main-700 rounded-md p-4">
            <div class="flex items-center">
              <div class="p-1.5 bg-green-900 rounded-md">
                <div class="w-5 h-5 bg-green-500 rounded-full"></div>
              </div>
              <div class="ml-3">
                <h3 class="text-xs font-medium text-gray-300">Active Servers</h3>
                <p class="text-xl font-semibold text-green-400">{{ activeServers.length }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-main-700 rounded-md p-4">
            <div class="flex items-center">
              <div class="p-1.5 bg-red-900 rounded-md">
                <div class="w-5 h-5 bg-red-500 rounded-full"></div>
              </div>
              <div class="ml-3">
                <h3 class="text-xs font-medium text-gray-300">Inactive Servers</h3>
                <p class="text-xl font-semibold text-red-400">{{ inactiveServers.length }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-main-700 rounded-md overflow-hidden">
          <div class="px-6 py-4 bg-main-900">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-semibold text-gray-100">Connected Servers</h2>
                <p class="text-sm text-gray-300 mt-1">
                  Servers that have submitted times within the last 2 weeks
                </p>
              </div>
              <div class="flex items-center space-x-3">
                <!-- API Key Creation Button -->
                <button
                  v-if="canManageKeys"
                  @click="openCreateKeyModal"
                  class="px-4 py-2 text-sm font-medium text-gray-100 bg-green-700 rounded-md hover:bg-green-600 transition-colors cursor-pointer"
                >
                  Create Server API Key
                </button>
                <button
                  @click="loadServers"
                  :disabled="loading"
                  class="px-4 py-2 text-sm font-medium text-gray-100 bg-main-600 rounded-md hover:bg-main-500 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  <div v-if="loading" class="flex items-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-100 mr-2"></div>
                    Loading...
                  </div>
                  <span v-else>Refresh</span>
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="loading" class="p-8 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-100 mx-auto"></div>
            <p class="mt-2 text-gray-300">Loading servers...</p>
          </div>
          
          <div v-else-if="error" class="p-8 text-center text-red-400">
            <p>{{ error }}</p>
          </div>
          
          <div v-else-if="servers.length === 0" class="p-8 text-center text-gray-300">
            <p>No servers found</p>
          </div>
          
          <div v-else class="divide-y divide-gray-700">
            <div 
              v-for="server in servers" 
              :key="server.server"
              class="group p-6 hover:bg-main-600 transition-colors bg-main-700 odd:bg-main-800 relative"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div 
                    :class="[
                      'w-3 h-3 rounded-full mr-6',
                      server.active ? 'bg-green-500' : 'bg-red-500'
                    ]"
                  ></div>
                  <div>
                    <h3 class="text-lg font-medium text-gray-100">{{ server.server }}</h3>
                    <div class="flex items-center flex-wrap gap-1 mt-1">
                      <span
                        v-for="(ip, index) in server.ips"
                        :key="ip"
                        @click="copyToClipboard(ip)"
                        class="text-sm text-gray-100 monospace cursor-pointer hover:text-gray-200 hover:bg-main-600 px-1 py-0.5 rounded transition-colors"
                        :title="`Click to copy ${ip}`"
                      >{{ ip }}<span v-if="index < server.ips.length - 1" class="text-gray-400">,</span></span>
                      <span v-if="server.ips && server.ips.length > 0" class="text-xs text-gray-400 ml-2">(click to copy)</span>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-3">
                  <!-- Edit Key Button (shown on hover) -->
                  <button
                    v-if="canManageKeys"
                    @click="openEditKeyModal(server.server)"
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-3 py-1.5 text-xs font-medium text-gray-300 bg-main-800 hover:bg-main-700 border border-main-500 hover:border-main-400 rounded-md hover:text-gray-100 transition-colors cursor-pointer mr-3"
                    title="Edit API key"
                  >
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Edit Key
                  </button>
                  
                  <span 
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      server.active 
                        ? 'bg-green-800 text-green-400' 
                        : 'bg-red-800 text-red-400'
                    ]"
                  >
                    {{ server.active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Create Key Modal -->
      <div v-if="showCreateKeyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeCreateKeyModal">
        <div class="bg-main-800 border border-main-400 rounded-lg shadow-lg p-6 w-[500px] max-w-[90vw] mx-4 relative" @click.stop>
          <!-- Close X Button -->
          <button
            @click="closeCreateKeyModal"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
            title="Close"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          
          <h3 class="text-lg font-semibold mb-4 text-gray-100">Create Server API Key</h3>
          <form @submit.prevent="createKey">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-300 mb-2">Server Name</label>
              <input
                v-model="createKeyForm.server"
                type="text"
                class="w-full px-3 py-2 bg-main-900 border border-main-600 text-gray-100 rounded-md focus:outline-none focus:border-main-400 transition-colors"
                placeholder="Enter server name"
                required
              />
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-300 mb-2">Permissions</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="createKeyForm.submitTimes"
                    type="checkbox"
                    class="rounded border-main-600 text-green-500 bg-main-900 focus:outline-none focus:ring-0"
                  />
                  <span class="ml-2 text-sm text-gray-200">Submit Times</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="createKeyForm.submitBulk"
                    type="checkbox"
                    class="rounded border-main-600 text-green-500 bg-main-900 focus:outline-none focus:ring-0"
                  />
                  <span class="ml-2 text-sm text-gray-200">Submit Bulk</span>
                </label>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                type="submit"
                :disabled="creatingKey"
                class="px-4 py-2 text-sm font-medium text-gray-100 bg-green-700 hover:bg-green-600 rounded-md transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {{ creatingKey ? 'Creating...' : 'Create Key' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Success Modal -->
      <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeSuccessModal">
        <div class="bg-main-800 border border-main-400 rounded-lg shadow-lg p-6 w-[500px] max-w-[90vw] mx-4 relative" @click.stop>
          <!-- Close X Button -->
          <button
            @click="closeSuccessModal"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
            title="Close"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          
          <h3 class="text-lg font-semibold mb-4 text-green-400">Success!</h3>
          <div v-if="createdKey" class="mb-4">
            <p class="text-sm text-gray-300 mb-2">API Key created successfully:</p>
            <div class="relative">
              <div 
                @click="copyCreatedKey"
                class="w-full px-3 py-2 bg-main-900 border border-main-600 rounded-md cursor-pointer hover:bg-main-800 transition-colors group"
                title="Click to copy API key"
              >
                <code class="text-sm text-gray-100 monospace blur-sm">{{ createdKey }}</code>
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
            <p class="text-xs text-red-400 mt-2">
              ⚠️ Save this key now! It won't be shown again.
            </p>
          </div>
          <div v-else class="mb-4">
            <p class="text-sm text-gray-300">API Key updated successfully!</p>
          </div>
          <div class="flex justify-end">
            <button
              @click="closeSuccessModal"
              class="px-4 py-2 text-sm font-medium text-gray-100 bg-green-700 hover:bg-green-600 rounded-md transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      
      <!-- Edit Key Modal -->
      <div v-if="showEditKeyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeEditKeyModal">
        <div class="bg-main-800 border border-main-400 rounded-lg shadow-lg p-6 w-[500px] max-w-[90vw] mx-4 relative" @click.stop>
          <!-- Close X Button -->
          <button
            @click="closeEditKeyModal"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
            title="Close"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          
          <h3 class="text-lg font-semibold mb-4 text-gray-100">Edit Server API Key</h3>
          <form @submit.prevent="updateKey">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-300 mb-2">Server Name</label>
              <input
                v-model="editKeyForm.server"
                type="text"
                class="w-full px-3 py-2 bg-main-900 border border-main-600 text-gray-400 rounded-md cursor-not-allowed"
                readonly
              />
            </div>
            
            <!-- API Key Display (Blurred) -->
            <div v-if="currentServerKeyInfo && !loadingKeyInfo" class="mb-4">
              <label class="block text-sm font-medium text-gray-300 mb-2">Current API Key</label>
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
            
            <!-- Loading State for Key Info -->
            <div v-else-if="loadingKeyInfo" class="mb-4">
              <label class="block text-sm font-medium text-gray-300 mb-2">Current API Key</label>
              <div class="w-full px-3 py-2 bg-main-900 border border-main-600 rounded-md flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-100 mr-2"></div>
                <span class="text-sm text-gray-400">Loading key information...</span>
              </div>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-300 mb-2">Permissions</label>
              <p class="text-xs text-gray-400 mb-3">Select the permissions you want to set for this server's API key.</p>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="editKeyForm.submitTimes"
                    type="checkbox"
                    class="rounded border-main-600 text-green-500 bg-main-900 focus:outline-none focus:ring-0"
                    :disabled="loadingKeyInfo"
                  />
                  <span class="ml-2 text-sm text-gray-200">Submit Times</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="editKeyForm.submitBulk"
                    type="checkbox"
                    class="rounded border-main-600 text-green-500 bg-main-900 focus:outline-none focus:ring-0"
                    :disabled="loadingKeyInfo"
                  />
                  <span class="ml-2 text-sm text-gray-200">Submit Bulk</span>
                </label>
              </div>
            </div>
            
            <div class="flex justify-between items-center">
              <button
                type="button"
                @click="confirmDeleteKey"
                :disabled="loadingKeyInfo || deletingKey"
                class="px-4 py-2 text-sm font-medium text-gray-100 bg-red-700 hover:bg-red-600 rounded-md transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {{ deletingKey ? 'Deleting...' : 'Delete Key' }}
              </button>
              
              <div class="flex space-x-3">
                <button
                  type="submit"
                  :disabled="updatingKey || loadingKeyInfo"
                  class="px-4 py-2 text-sm font-medium text-gray-100 bg-blue-700 hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {{ updatingKey ? 'Updating...' : 'Update Permissions' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="cancelDeleteKey">
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
    </div>
    
    <!-- Toast Notification -->
    <Toast
      :show="showToast"
      :type="toastType"
      :title="toastTitle"
      :message="toastMessage"
      @close="closeToast"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import OffstylesApi from '@/api/offstylesApi';
import type { ServerActivityDocument, ServerKeyInfo } from '@/api/offstylesApi';
import { KeyPermissions, addPermission } from '@/utils/permissions';
import { canManageApiKeys } from '@/utils/userPermissions';
import { useAuth } from '@/stores/auth';
import Toast from '@/components/Toast.vue';

// Auth
const { user } = useAuth();

// Check if user has admin permissions
const canManageKeys = computed(() => {
  return user.value && canManageApiKeys(user.value.permissions);
});

// Data
const servers = ref<ServerActivityDocument[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Computed properties for server statistics
const activeServers = computed(() => servers.value.filter(s => s.active));
const inactiveServers = computed(() => servers.value.filter(s => !s.active));
const totalServers = computed(() => servers.value.length);

// Modal states
const showCreateKeyModal = ref(false);
const showEditKeyModal = ref(false);
const showSuccessModal = ref(false);
const creatingKey = ref(false);
const updatingKey = ref(false);
const createdKey = ref<string | null>(null);

// Toast state
const showToast = ref(false);
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('info');
const toastTitle = ref('');
const toastMessage = ref('');

// Forms
const createKeyForm = ref({
  server: '',
  submitTimes: false,
  submitBulk: false
});

const editKeyForm = ref({
  server: '',
  submitTimes: false,
  submitBulk: false
});

// Store current API key info for editing
const currentServerKeyInfo = ref<ServerKeyInfo | null>(null);
const loadingKeyInfo = ref(false);

// Delete confirmation state
const showDeleteConfirm = ref(false);
const deletingKey = ref(false);

// Methods
const loadServers = async () => {
  try {
    loading.value = true;
    error.value = null;
    servers.value = await OffstylesApi.getServers();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load servers';
    console.error('Failed to load servers:', err);
  } finally {
    loading.value = false;
  }
};

const openCreateKeyModal = () => {
  createKeyForm.value = {
    server: '',
    submitTimes: false,
    submitBulk: false
  };
  showCreateKeyModal.value = true;
};

const closeCreateKeyModal = () => {
  showCreateKeyModal.value = false;
  createKeyForm.value = {
    server: '',
    submitTimes: false,
    submitBulk: false
  };
};

const closeSuccessModal = async () => {
  showSuccessModal.value = false;
  createdKey.value = null;
  // Refresh servers list after closing success modal
  await loadServers();
};

const createKey = async () => {
  try {
    creatingKey.value = true;
    
    let permissions = 0;
    if (createKeyForm.value.submitTimes) {
      permissions = addPermission(permissions, KeyPermissions.SUBMIT_TIMES);
    }
    if (createKeyForm.value.submitBulk) {
      permissions = addPermission(permissions, KeyPermissions.SUBMIT_BULK);
    }
    
    const result = await OffstylesApi.createApiKey(
      createKeyForm.value.server,
      permissions
    );
    
    createdKey.value = result.key;
    closeCreateKeyModal();
    showSuccessModal.value = true;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create API key';
    console.error('Failed to create API key:', err);
  } finally {
    creatingKey.value = false;
  }
};

const openEditKeyModal = async (serverName: string) => {
  try {
    loadingKeyInfo.value = true;
    showEditKeyModal.value = true;
    
    // Get current server key info
    const keyInfo = await OffstylesApi.getServerKeyInfo(serverName);
    currentServerKeyInfo.value = keyInfo;
    
    editKeyForm.value = {
      server: serverName,
      submitTimes: (keyInfo.permissions & KeyPermissions.SUBMIT_TIMES) !== 0,
      submitBulk: (keyInfo.permissions & KeyPermissions.SUBMIT_BULK) !== 0
    };
  } catch (err) {
    showToastMessage('error', 'Error', 'Failed to load server permissions');
    console.error('Failed to load server permissions:', err);
    closeEditKeyModal();
  } finally {
    loadingKeyInfo.value = false;
  }
};

const closeEditKeyModal = () => {
  showEditKeyModal.value = false;
  showDeleteConfirm.value = false;
  currentServerKeyInfo.value = null;
  loadingKeyInfo.value = false;
  deletingKey.value = false;
  editKeyForm.value = {
    server: '',
    submitTimes: false,
    submitBulk: false
  };
};

const confirmDeleteKey = () => {
  showDeleteConfirm.value = true;
};

const cancelDeleteKey = () => {
  showDeleteConfirm.value = false;
};

const executeDeleteKey = async () => {
  if (!currentServerKeyInfo.value) return;
  
  // Store server name before clearing the state
  const serverName = currentServerKeyInfo.value.server;
  
  try {
    deletingKey.value = true;
    
    await OffstylesApi.deleteApiKey(serverName);
    
    // Refresh the servers list to reflect the changes
    await loadServers();
    
    closeEditKeyModal();
    showToastMessage('success', 'Deleted!', `API key for ${serverName} has been deleted`);
  } catch (err) {
    showToastMessage('error', 'Error', 'Failed to delete API key');
    console.error('Failed to delete API key:', err);
  } finally {
    deletingKey.value = false;
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
    
    closeEditKeyModal();
    showSuccessModal.value = true;
    showToastMessage('success', 'Success', 'Server permissions updated successfully');
  } catch (err) {
    showToastMessage('error', 'Error', 'Failed to update server permissions');
    console.error('Failed to update server permissions:', err);
  } finally {
    updatingKey.value = false;
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    showToastMessage('success', 'Copied!', `IP address ${text} copied to clipboard`);
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToastMessage('success', 'Copied!', `IP address ${text} copied to clipboard`);
  }
};

const copyApiKey = async () => {
  if (currentServerKeyInfo.value?.key) {
    try {
      await navigator.clipboard.writeText(currentServerKeyInfo.value.key);
      showToastMessage('success', 'Copied!', `API key for ${currentServerKeyInfo.value.server} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy API key to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentServerKeyInfo.value.key;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToastMessage('success', 'Copied!', `API key for ${currentServerKeyInfo.value.server} copied to clipboard`);
    }
  }
};

const copyCreatedKey = async () => {
  if (createdKey.value) {
    try {
      await navigator.clipboard.writeText(createdKey.value);
      showToastMessage('success', 'Copied!', 'API key copied to clipboard');
    } catch (err) {
      console.error('Failed to copy API key to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = createdKey.value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToastMessage('success', 'Copied!', 'API key copied to clipboard');
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

// Lifecycle
onMounted(() => {
  loadServers();
});
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
.group:hover {
  transition: all 0.2s ease-in-out;
}

/* Ensure the edit button appears smoothly on hover */
.group .opacity-0 {
  transition: opacity 0.2s ease-in-out;
}
</style>