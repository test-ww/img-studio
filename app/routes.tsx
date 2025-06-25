// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export const pages = {
  Generate: {
    name: '生成',
    description: '从头开始或使用参考内容创建新内容',
    href: '/generate',
    status: 'true',
  },
  Edit: {
    name: '编辑',
    description: '导入、编辑和转换现有内容',
    href: '/edit',
    status: process.env.NEXT_PUBLIC_EDIT_ENABLED,
  },
  Library: {
    name: '浏览',
    description: "浏览团队库中的共享作品",
    href: '/library',
    status: 'true',
  },
}
