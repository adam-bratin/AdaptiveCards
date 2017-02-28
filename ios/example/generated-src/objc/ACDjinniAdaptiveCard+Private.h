// AUTOGENERATED FILE - DO NOT MODIFY!
// This file generated by Djinni from adaptivecards.djinni

#include "DjinniAdaptiveCard.hpp"
#include <memory>

static_assert(__has_feature(objc_arc), "Djinni requires ARC to be enabled for this file");

@class ACDjinniAdaptiveCard;

namespace djinni_generated {

class DjinniAdaptiveCard
{
public:
    using CppType = std::shared_ptr<::djinni::DjinniAdaptiveCard>;
    using CppOptType = std::shared_ptr<::djinni::DjinniAdaptiveCard>;
    using ObjcType = ACDjinniAdaptiveCard*;

    using Boxed = DjinniAdaptiveCard;

    static CppType toCpp(ObjcType objc);
    static ObjcType fromCppOpt(const CppOptType& cpp);
    static ObjcType fromCpp(const CppType& cpp) { return fromCppOpt(cpp); }

private:
    class ObjcProxy;
};

}  // namespace djinni_generated

