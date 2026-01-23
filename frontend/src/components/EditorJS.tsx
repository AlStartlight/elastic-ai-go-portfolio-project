import React, { useEffect, useRef, memo } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import CodeTool from '@editorjs/code';
import CloudinaryImageTool from './CloudinaryImageTool';
import '../styles/cloudinary-image-tool.css';

interface EditorJSComponentProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  holder?: string;
}

const EditorJSComponent: React.FC<EditorJSComponentProps> = memo(({ 
  data, 
  onChange,
  holder = 'editorjs-container'
}) => {
  const editorInstance = useRef<EditorJS | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (isInitialized.current) return;

    const initEditor = async () => {
      // Destroy existing instance
      if (editorInstance.current && typeof editorInstance.current.destroy === 'function') {
        try {
          await editorInstance.current.destroy();
        } catch (error) {
          console.error('Error destroying editor:', error);
        }
        editorInstance.current = null;
      }

      try {
        const editor = new EditorJS({
          holder: holder,
          placeholder: 'Start writing your article content here...',
          data: data || {
            time: Date.now(),
            blocks: [],
            version: '2.30.8'
          },
          onChange: async (api) => {
            try {
              const outputData = await api.saver.save();
              if (onChange) {
                onChange(outputData);
              }
            } catch (error) {
              console.error('Error saving editor data:', error);
            }
          },
          tools: {
            header: {
              class: Header as any,
              config: {
                placeholder: 'Enter a header',
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2
              }
            },
            paragraph: {
              class: Paragraph as any,
              inlineToolbar: true,
              config: {
                placeholder: 'Enter paragraph text...'
              }
            },
            list: {
              class: List as any,
              inlineToolbar: true,
              config: {
                defaultStyle: 'unordered'
              }
            },
            code: {
              class: CodeTool as any,
              config: {
                placeholder: 'Enter code snippet...'
              }
            },
            image: {
              class: CloudinaryImageTool as any,
            }
          },
          onReady: () => {
            console.log('Editor.js is ready to work!');
            isInitialized.current = true;
          },
        });

        editorInstance.current = editor;
      } catch (error) {
        console.error('Error initializing editor:', error);
      }
    };

    initEditor();

    // Cleanup
    return () => {
      if (editorInstance.current && typeof editorInstance.current.destroy === 'function') {
        try {
          editorInstance.current.destroy();
        } catch (error) {
          console.error('Error in cleanup:', error);
        }
        editorInstance.current = null;
        isInitialized.current = false;
      }
    };
  }, []); // Only run once on mount

  // Update editor data when prop changes
  useEffect(() => {
    if (editorInstance.current && data && isInitialized.current) {
      editorInstance.current.render(data).catch(console.error);
    }
  }, [data]);

  return (
    <div className="w-full">
      <div 
        id={holder}
        className="prose prose-invert max-w-none min-h-[400px] bg-gray-800/50 rounded-lg p-6 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        style={{
          fontSize: '16px',
          lineHeight: '1.6'
        }}
      />
    </div>
  );
});

EditorJSComponent.displayName = 'EditorJSComponent';

export default EditorJSComponent;
