<!--
TagInput.vue -- Analyzing User Tag
Copyright (C) 2024 Nora Moor, Katie Pryal, and GOSQAS
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>. -->


<template>
  <div class="container">
    <input id="tagInputField" class="form-control" required placeholder="Record Tag" :value="editableValue" @input="onInput" />

    <h5 class="mt-3 mb-1 text-iris">Suggested Tags</h5>
    <div class="tag-container mb-2">
      <button class="tag" type="button" v-for="tag in TagName" v-bind:style="'color: '+textColorForTag(tag)+'; background-color: '+getColorForTag(tag)+';'" 
      @click="moveTagToForm(tag)">{{ tag }}</button>
    </div>
  </div>
</template>

<script>
import { getDecipheredForbiddenTags } from '~/utils/forbiddenTags';
import { TagName } from "~/utils/tags";

export default {
  name: 'TagInput',
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    separator: {
      type: String,
      default: ' ',
    },
  },
  emits: ['updateTags'],
  data() {
    return {
      tags: this.modelValue,
    };
  },
  computed: {
    editableValue: {
      get() {
        return this.tags.join(this.separator);
      },
      set(value) {
        const $value = value.trim() ? value.split(this.separator) : [];
        const uniqueValues = [...new Set($value)];
        const transformedValues = uniqueValues.map(tag => tag.toLowerCase().trim());
        this.tags = transformedValues;
        const cleanArray = this.cleanArray(this.tags); // Calling forbidden tags method.
        this.$emit ('updateTags', cleanArray);
      },
    },
  },
  methods: {
    cleanArray(arr) { //checking to see if correct
        const forbiddenWords = getDecipheredForbiddenTags();
        const cleanedArray = arr.filter (tagName => !forbiddenWords.includes (tagName.toLowerCase ()));
        return cleanedArray;
    },
    onInput(event) {
      this.editableValue = event.target.value;
    },
    moveTagToForm(tag, event) {
      if (document.getElementById('tagInputField')) {
          const inputField = document.getElementById('tagInputField');
          this.editableValue += tag + ' ';
      }
    },
  },
};
</script>

<style>
  .tag-container {
    display: flex;
    flex-wrap: wrap;
  }

  .tag {
    color: #333;
    padding: 5px 10px;
    margin: 5px;
    border-radius: 5px;
    font-size: 14px;
    border: none;
  }

  .container {
    background-color: transparent;
    padding: 0px;
  }

  #editableValue {
    margin-top: 5px;
    padding-top: 5px;
  }
</style>