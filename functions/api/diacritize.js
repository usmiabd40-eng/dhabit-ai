export async function onRequestPost({ request, env }) {
  try {
    const { text, mode = "full", preserveExisting = true } = await request.json();
    if (typeof text !== "string" || !text.trim()) return json({ error: "النص فارغ." }, 400);
    if (text.length > 12000) return json({ error: "الحد الأقصى ١٢٬٠٠٠ حرف في الطلب الواحد." }, 413);
    if (!env.OPENAI_API_KEY) return json({ error: "لم يتم ضبط OPENAI_API_KEY في إعدادات الخادم." }, 503);
    const instruction = mode === "ending"
      ? "أضف حركات أواخر الكلمات اللازمة للإعراب، واترك داخل الكلمات دون تشكيل إلا عند الضرورة."
      : "أضف التشكيل العربي الكامل لكل كلمة: الحركات، الشدة، السكون، التنوين، والهمزات عند الحاجة.";
    const prompt = `أنت مدقق لغوي متخصص في النحو والصرف العربيين. مهمتك تشكيل النص الآتي فقط.\n${instruction}\nحلّل السياق والتركيب النحوي والصيغة الصرفية قبل اختيار الحركة. لا تعِد الصياغة ولا تشرح ولا تضف مقدمة أو علامات تنسيق. حافظ على فواصل الأسطر وعلامات الترقيم. ${preserveExisting ? "حافظ على التشكيل الصحيح الموجود وصحح الناقص فقط." : "أعد ضبط التشكيل من البداية."}\nإذا احتمل اللفظ أكثر من وجه، اختر الأرجح من السياق ولا تخترع معنى.\nالنص:\n${text}`;
    const response = await fetch(env.OPENAI_BASE_URL || "https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.1,
        messages: [
          { role: "system", content: "أنت خبير في اللغة العربية الفصحى، علم النحو، علم الصرف، وضبط النصوص بالشكل." },
          { role: "user", content: prompt }
        ]
      })
    });
    if (!response.ok) return json({ error: "خدمة الذكاء الاصطناعي لم تقبل الطلب. تحقق من المفتاح وإعدادات النموذج." }, 502);
    const data = await response.json();
    const output = data.choices?.[0]?.message?.content?.trim();
    if (!output) return json({ error: "لم تُرجع الخدمة نصاً مشكولاً." }, 502);
    return json({ text: output, note: "تم التشكيل آلياً بالاستناد إلى سياق الجملة. راجع المواضع المحتملة للّبس." });
  } catch { return json({ error: "حدث خطأ أثناء معالجة النص." }, 500); }
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}