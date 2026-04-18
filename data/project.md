# Proyecto: Generador de Combos de Boxeo para Entrenamiento en Saco
## Descripción del Proyecto
Este proyecto consiste en desarrollar una aplicación de entrenamiento de boxeo enfocada en la generación de combos para practicar en el saco. La aplicación permitirá a los usuarios seleccionar el nivel de dificultad del combo (principiante, intermedio o avanzado) y ajustar la velocidad del combo mediante un slider de BPM (pulsos por minuto). La aplicación generará combos aleatorios basados en las acciones definidas en los archivos `actions.md` y `combo-rules.md`, respetando las reglas de combinación de acciones y el nivel de dificultad seleccionado.
## Funcionalidades Principales
1. **Selector de Nivel de Dificultad**: Permite a los usuarios elegir entre tres niveles de dificultad para los combos:
   - Principiante: 2-5 acciones
   - Intermedio: 5-9 acciones
   - Avanzado: >9 acciones
2. **Slider de Velocidad (BPM)**: Permite a los usuarios ajustar la velocidad del combo en BPM, lo que afectará el tempo asignado a cada acción en el combo.
3. **Generación de Combos Aleatorios**: Al pulsar un botón, la aplicación generará un combo aleatorio que cumpla con las reglas de combinación de acciones y el nivel de dificultad seleccionado. Además, las acciones tendrán sus propias figuras musicales, pudiendo ser tres acciones en tempo de negras, corcheas, tresillos, etc (cualquier tipo de combinación de figuras musicales).
4. **Visualización del Combo**: El combo generado se mostrará en pantalla con las acciones listadas en orden, junto con su tempo asignado.
5. **Reproducción de Combos**: Un botón permitirá reproducir el combo generado utilizando sonidos pregrabados para cada acción, sincronizados con el tempo asignado a cada una.
6. **Metrónomo en Bucle**: Un botón para activar un metrónomo que marque el tempo general del combo, ayudando al usuario a mantener el ritmo durante la práctica.
## Tecnologías Sugeridas
- **Frontend**: Angular y angular material en sus últimas versiones para la interfaz de usuario.
- **Backend**: Ninguno, toda la lógica de generación de combos y reproducción de sonidos se manejará en el frontend.
- **Sonidos**: Pregrabados para cada acción, sincronizados con el tempo asignado a cada acción en el combo.
## Consideraciones Adicionales
- Asegurarse de que la generación de combos respete las reglas de combinación de acciones definidas en `combo-rules.md`.
- Implementar una interfaz de usuario intuitiva y fácil de usar, con botones claramente etiquetados para generar combos, reproducirlos y activar el metrónomo.
- Proporcionar retroalimentación visual y auditiva para ayudar a los usuarios a practicar los combos con el ritmo correcto.
- Considerar la posibilidad de agregar una función para guardar combos favoritos o compartirlos con otros usuarios en futuras versiones de la aplicación.
- La versión final de esta aplicación será una pwa que se subirá a Github pages para que los usuarios puedan acceder a ella desde cualquier dispositivo con acceso a internet, por lo que una vez desarrollada la aplicación al completo, debes documentar los pasos a seguir para este fin.
- El almacenamiento de los combos generados y favoritos se realizará utilizando el almacenamiento local del navegador (localStorage) para garantizar que los datos persistan entre sesiones sin necesidad de un backend, y si es posible, en el propio Android.
## Conclusión
Este proyecto tiene como objetivo proporcionar a los boxeadores una herramienta interactiva y personalizada para mejorar su entrenamiento en el saco, permitiéndoles practicar combos variados y ajustados a su nivel de habilidad y ritmo preferido. La aplicación no solo facilitará la generación de combos, sino que también ayudará a los usuarios a mantener el ritmo correcto durante su práctica, lo que es esencial para el desarrollo de habilidades de boxeo efectivas.

